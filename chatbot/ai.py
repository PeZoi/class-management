import os
import time
import hashlib
import re
import json
from dotenv import load_dotenv
from openai import OpenAI
from schema import DB_SCHEMA

# Important on Windows + uvicorn reload: ensure .env overrides existing env vars.
load_dotenv(override=True)

_client: OpenAI | None = None
_client_api_key: str | None = None
_client_base_url: str | None = None


class LLMQuotaError(RuntimeError):
    pass


def _get_client() -> OpenAI:
    global _client, _client_api_key, _client_base_url

    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("Thiếu GROQ_API_KEY trong file .env")

    base_url = (os.getenv("GROQ_BASE_URL") or "https://api.groq.com/openai/v1").strip()

    # Support hot-reload / .env changes: if key changed, rebuild client.
    if _client is None or _client_api_key != api_key or _client_base_url != base_url:
        fp = hashlib.sha256(api_key.encode("utf-8")).hexdigest()[:10]
        model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
        print(f"[Groq] init client key_fp={fp} model={model} base_url={base_url}")
        _client = OpenAI(api_key=api_key, base_url=base_url)
        _client_api_key = api_key
        _client_base_url = base_url

    return _client


def _call_llm(prompt: str) -> str:
    last_err: Exception | None = None
    for attempt in range(4):  # 1 initial + 3 retries
        try:
            client = _get_client()
            model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
            res = client.responses.create(input=prompt, model=model)
            text = getattr(res, "output_text", None)
            return (text or "").strip()
        except Exception as e:
            last_err = e
            msg = str(e)
            status = getattr(e, "status_code", None)
            is_rate_limit = (status == 429) or ("429" in msg) or ("rate limit" in msg.lower())
            is_overloaded = ("503" in msg) or ("overloaded" in msg.lower())

            if not (is_rate_limit or is_overloaded):
                raise

            delay = min(2.0 * (2**attempt), 10.0)
            time.sleep(delay)

    raise LLMQuotaError(f"LLM rate limit/quota: {last_err}") from last_err


def _extract_student_name_from_question(question: str) -> str | None:
    """
    Extract student name when user asks for "thông tin (chi tiết) ... học viên <Tên>".
    Returns None if no clear name pattern is found.
    """
    q = (question or "").strip()
    if not q or len(q) < 5:
        return None
    q_lower = q.lower()
    # "thông tin ... học viên X" / "hoc vien X" / "học viên X"
    for sep in ["học viên", "hoc vien"]:
        if sep in q_lower:
            idx = q_lower.index(sep)
            # Take text after "học viên " (with space)
            after = q[idx + len(sep) :].strip()
            # Remove trailing punctuation and common suffixes
            after = re.sub(r"[.?!,;:]+\s*$", "", after).strip()
            if len(after) >= 2 and re.match(r"^[A-Za-zÀ-ỹ\s\-\.]+$", after):
                return after.strip()
    return None


def _cut_after_first_statement(sql: str) -> str:
    """
    If the model returns multiple SQL statements, keep only the first one.
    Important: do NOT treat semicolons inside quotes as statement terminators.
    """
    s = (sql or "").strip()
    if not s:
        return s

    in_single = False
    in_double = False
    in_backtick = False
    escaped = False

    for i, ch in enumerate(s):
        if escaped:
            escaped = False
            continue

        if ch == "\\":
            escaped = True
            continue

        if in_backtick:
            if ch == "`":
                in_backtick = False
            continue

        if in_single:
            if ch == "'":
                in_single = False
            continue

        if in_double:
            if ch == '"':
                in_double = False
            continue

        if ch == "`":
            in_backtick = True
            continue
        if ch == "'":
            in_single = True
            continue
        if ch == '"':
            in_double = True
            continue

        if ch == ";":
            # If there's another SELECT after this semicolon, it's likely a second statement.
            tail = s[i + 1 :]
            if re.search(r"(?is)\bselect\b", tail):
                return s[: i + 1].strip()

    return s


# ======================
# DOMAIN CHECK
# ======================
def check_domain(question):

    prompt = f"""
Bạn kiểm tra câu hỏi có thuộc hệ thống quản lý lớp học không.

Nếu KHÔNG liên quan → trả về OUT_OF_SCOPE
Nếu liên quan → trả về OK

Câu hỏi: {question}
"""

    return _call_llm(prompt)


# ======================
# SQL GENERATION
# ======================
def generate_sql(question):
    q_lower = (question or "").lower()
    # "Thông tin hoá đơn INC-xxxx" / "invoice INC-xxxx" → tra theo payment.payment_id
    # (Trong schema, payment_id là business id dạng INC-...)
    if ("hoá đơn" in q_lower or "hoa don" in q_lower or "invoice" in q_lower) and re.search(r"\binc-[a-z0-9]+\b", q_lower):
        m = re.search(r"\b(inc-[a-z0-9]+)\b", q_lower)
        invoice_id = (m.group(1).upper() if m else "").replace("'", "''")
        return (
            "SELECT "
            "p.payment_id, p.payment_type, p.payment_status, p.payment_method, "
            "p.direction, p.amount, p.paid, p.created_at, p.note, "
            "s.full_name AS student_name, s.email AS student_email, "
            "t.full_name AS teacher_name, t.email AS teacher_email, "
            "c.name AS class_name "
            "FROM payment p "
            "LEFT JOIN student s ON s.id = p.student_id "
            "LEFT JOIN `user` t ON t.id = p.teacher_id "
            "LEFT JOIN class c ON c.id = p.class_id "
            f"WHERE p.payment_id = '{invoice_id}' "
            "LIMIT 20"
        )
    # "Hoàn thành học phí đúng hạn" → hiểu là đã đóng đủ (PAID) cho các gói học phí.
    # (DB hiện không có cột "due_date/paid_at" chuẩn, nên tránh suy đoán mốc hạn.)
    if (
        ("hoàn thành" in q_lower or "hoan thanh" in q_lower)
        and ("học phí" in q_lower or "hoc phi" in q_lower)
        and ("đúng hạn" in q_lower or "dung han" in q_lower)
        and ("bao nhiêu" in q_lower or "có bao nhiêu" in q_lower or "co bao nhieu" in q_lower)
    ):
        return (
            "SELECT "
            "COUNT(DISTINCT pkg.student_id) AS so_nguoi_hoan_thanh_hoc_phi "
            "FROM session_payment_package pkg "
            "WHERE pkg.status = 'PAID' "
            "LIMIT 20"
        )
    # "Thu và chi trong tháng X" → tính theo số tiền đã thực sự thanh toán (paid), theo ngày giờ tạo (created_at), không theo billing_month.
    if ("thu" in q_lower and "chi" in q_lower) or "thu và chi" in q_lower:
        thang_match = re.search(r"tháng\s*(\d{1,2})", q_lower)
        thang = int(thang_match.group(1)) if thang_match else 3
        return (
            "SELECT "
            "SUM(CASE WHEN direction = 'INCOME' THEN paid ELSE 0 END) AS thu, "
            "SUM(CASE WHEN direction = 'EXPENSE' THEN paid ELSE 0 END) AS chi "
            "FROM payment "
            f"WHERE MONTH(created_at) = {thang} AND YEAR(created_at) = YEAR(CURDATE()) LIMIT 20"
        )

    # "Doanh thu tháng này là bao nhiêu" → tổng số tiền đã thu (paid) cho INCOME trong tháng hiện tại.
    if "doanh thu" in q_lower or ("thu" in q_lower and "tháng" in q_lower and "bao nhiêu" in q_lower):
        return (
            "SELECT SUM(paid) AS doanh_thu "
            "FROM payment "
            "WHERE direction = 'INCOME' "
            "  AND MONTH(created_at) = MONTH(CURDATE()) "
            "  AND YEAR(created_at) = YEAR(CURDATE()) "
            "LIMIT 20"
        )

    # "Học viên đang còn nợ" / "đóng còn thiếu" = có package (session_payment_package) chưa trả hết: status IN ('UNPAID','PARTIAL').
    # Package được tạo khi điểm danh đủ 8 ngày; nợ = chưa đóng hoặc đóng thiếu.
    if (
        "nợ" in q_lower
        or "còn nợ" in q_lower
        or "còn thiếu" in q_lower
        or "con thieu" in q_lower
        or "đóng thiếu" in q_lower
        or "dong thieu" in q_lower
    ):
        return (
            "SELECT s.id, s.full_name, s.email, s.phone_number, "
            "SUM(pkg.expected_amount - pkg.paid_amount) AS tong_con_no "
            "FROM student s "
            "JOIN session_payment_package pkg ON pkg.student_id = s.id "
            "WHERE pkg.status IN ('UNPAID', 'PARTIAL') "
            "GROUP BY s.id, s.full_name, s.email, s.phone_number "
            "HAVING tong_con_no > 0 ORDER BY tong_con_no DESC LIMIT 20"
        )

    # "Thông tin chi tiết (của/về/cho) học viên <Tên>" → luôn lọc theo tên, không phụ thuộc LLM
    student_name = _extract_student_name_from_question(question)
    if student_name and ("thông tin" in q_lower or "thong tin" in q_lower):
        safe_name = student_name.replace("\\", "\\\\").replace("'", "''")
        return (
            f"SELECT * FROM student WHERE full_name LIKE '%{safe_name}%' LIMIT 20"
        )

    # "Đóng tiền trước" = prepaid: học viên đã thanh toán cho gói (package) CHƯA học tới.
    # Cần trả được chi tiết từng package: số gói, ngày đóng tiền, số tiền, v.v.
    # Logic:
    #   - attendance_by_student_class: với mỗi (student_id, class_id), tính current_package_number = FLOOR((MAX(session_number) - 1)/8) + 1
    #   - Một package được coi là "đóng trước" nếu:
    #       pkg.status = 'PAID'
    #       AND (current_package_number IS NULL OR pkg.package_number > current_package_number)
    if "đóng tiền" in q_lower and ("trước" in q_lower or "truoc" in q_lower):
        return (
            "SELECT "
            "  s.id AS student_id, "
            "  s.full_name, "
            "  s.email, "
            "  s.phone_number, "
            "  c.name AS class_name, "
            "  pkg.class_id, "
            "  pkg.package_number, "
            "  pkg.expected_amount, "
            "  pkg.paid_amount, "
            "  pkg.status AS package_status, "
            "  pkg.created_at_package, "
            "  pkg.completed_at, "
            "  p.payment_id, "
            "  p.amount AS payment_amount, "
            "  p.created_at AS payment_created_at "
            "FROM student s "
            "JOIN session_payment_package pkg ON pkg.student_id = s.id "
            "JOIN class c ON c.id = pkg.class_id "
            "LEFT JOIN ( "
            "  SELECT "
            "    student_id, "
            "    class_id, "
            "    FLOOR((MAX(session_number) - 1) / 8) + 1 AS current_package_number "
            "  FROM attendance "
            "  GROUP BY student_id, class_id "
            ") att ON att.student_id = pkg.student_id AND att.class_id = pkg.class_id "
            "LEFT JOIN payment p "
            "  ON p.student_id = s.id "
            " AND p.class_id = pkg.class_id "
            " AND p.package_number = pkg.package_number "
            " AND p.payment_status = 'COMPLETED' "
            " AND p.payment_type = 'STUDENT_FEE' "
            "WHERE pkg.status = 'PAID' "
            "  AND (att.current_package_number IS NULL OR pkg.package_number > att.current_package_number) "
            "ORDER BY s.full_name ASC, class_name ASC, pkg.package_number ASC "
            "LIMIT 20"
        )

    prompt = f"""
You are a MySQL expert.

DATABASE:
{DB_SCHEMA}

RULES:
- Return EXACTLY ONE SQL query
- The query MUST start with SELECT
- ONLY SELECT queries (no WITH, no multiple statements)
- Do NOT use window functions (no OVER()).
- Do NOT use PostgreSQL-only functions like DATE_TRUNC, NOW() with precision, or ::type casts.
- Use only pure MySQL functions for dates: DATE(), DATE_FORMAT(), YEAR(), MONTH(), DAY(), etc.
- Do NOT invent columns. Only use columns that exist in DB_SCHEMA (e.g. avoid paid_at/paidAt).
- If you need both "total count" and "list rows" in one query, use a scalar subquery for the total.
- NEVER modify database
- ALWAYS LIMIT 20
- Ignore deleted classes:
  - Always alias `class` as c
  - Always filter: COALESCE(c.is_deleted, 0) = 0
- If you use table aliases, always reference columns via the alias (not the original table name).
- "Bao nhiêu buổi" / "số buổi học" / "đã học bao nhiêu buổi" trong tháng: dùng bảng attendance, JOIN student ON attendance.student_id = student.id, WHERE student.full_name = '<tên>' AND MONTH(attendance.session_date) = <tháng> AND YEAR(attendance.session_date) = <năm hoặc YEAR(CURDATE())>, SELECT COUNT(*) AS so_buoi. KHÔNG lọc theo attendance.status (không thêm AND attendance.status = 'PRESENT') trừ khi người dùng hỏi rõ "có mặt" / "đi học" / "vắng" — đếm tất cả bản ghi điểm danh trong kỳ.
- "Thu và chi" / "đã thu và chi bao nhiêu" trong tháng: tính theo ngày giờ tạo (created_at), không theo billing_month. MỘT câu SELECT, bảng payment, SUM(CASE WHEN direction = 'INCOME' THEN amount ELSE 0 END) AS thu, SUM(CASE WHEN direction = 'EXPENSE' THEN amount ELSE 0 END) AS chi, WHERE MONTH(created_at) = <tháng> AND YEAR(created_at) = YEAR(CURDATE()), LIMIT 20.
- "Học viên đang còn nợ" / "ai còn nợ tiền": không lưu package khi nợ; package được tạo khi điểm danh đủ 8 ngày để đóng tiền. Nợ = session_payment_package có status IN ('UNPAID','PARTIAL'). Dùng session_payment_package JOIN student, WHERE status IN ('UNPAID','PARTIAL'), có thể GROUP BY student và SUM(expected_amount - paid_amount) AS tong_con_no, HAVING tong_con_no > 0.
- "Danh sách học viên đóng tiền trước" / "những người đóng tiền trước": nghĩa là prepaid — đã đóng tiền cho gói CHƯA học tới. Dùng session_payment_package + attendance + payment: với mỗi (student, class), tính current_package_number = FLOOR((MAX(attendance.session_number) - 1)/8) + 1 (nếu không có attendance → 0). Các package thỏa: pkg.status = 'PAID' và (current_package_number IS NULL OR pkg.package_number > current_package_number). JOIN thêm payment theo student_id, class_id, package_number, payment_type='STUDENT_FEE', payment_status='COMPLETED' để lấy ngày đóng tiền. SELECT chi tiết từng package (package_number, expected_amount, paid_amount, created_at_package, completed_at, payment_created_at...), LIMIT 20.
- When the user asks for a SPECIFIC person by name (e.g. "thông tin học viên Carson Freeman", "thông tin chi tiết về Nguyễn Văn A"), you MUST filter by that name: use WHERE full_name = '<name>' or WHERE full_name LIKE '%<name>%'. Escape single quotes in names by doubling them. NEVER return SELECT * FROM student LIMIT 1 when the question mentions a specific person's name.
- Return SQL only

QUESTION:
{question}
"""

    text = _call_llm(prompt)
    raw = (text or "").strip()

    # Remove code fences if present.
    raw = re.sub(r"(?is)```(?:sql|mysql)?\s*", "", raw)
    raw = re.sub(r"(?is)```", "", raw).strip()

    # Drop leading SQL comments so validator doesn't reject the query.
    raw = re.sub(r"(?m)^\s*--.*?$", "", raw)          # line comments
    raw = re.sub(r"(?is)^\s*/\*[\s\S]*?\*/\s*", "", raw)  # leading block comment
    raw = raw.strip()

    # Extract the first SELECT statement only.
    m = re.search(r"(?is)\bselect\b[\s\S]*?(;|$)", raw)
    if m:
        sql = m.group(0).strip()
        return _cut_after_first_statement(sql)

    # LLM đôi khi trả về không có SELECT → fallback an toàn.
    q_lower = (question or "").lower()
    if any(k in q_lower for k in ("sớm nhất", "đầu tiên", "earliest", "first", "sớm nhật")):
        return "SELECT * FROM student ORDER BY created_at ASC LIMIT 1"
    # Nếu câu hỏi có nhắc tên học viên cụ thể, fallback vẫn lọc theo tên thay vì trả bản ghi bất kỳ
    fallback_name = _extract_student_name_from_question(question)
    if fallback_name:
        safe_name = fallback_name.replace("\\", "\\\\").replace("'", "''")
        return f"SELECT * FROM student WHERE full_name LIKE '%{safe_name}%' LIMIT 20"
    # "Danh sách học viên đóng tiền trước" (prepaid) → fallback đúng ý
    if "đóng tiền" in q_lower or "truoc" in q_lower:
        return (
            "SELECT "
            "  s.id AS student_id, "
            "  s.full_name, "
            "  s.email, "
            "  s.phone_number, "
            "  c.name AS class_name, "
            "  pkg.class_id, "
            "  pkg.package_number, "
            "  pkg.expected_amount, "
            "  pkg.paid_amount, "
            "  pkg.status AS package_status, "
            "  pkg.created_at_package, "
            "  pkg.completed_at, "
            "  p.payment_id, "
            "  p.amount AS payment_amount, "
            "  p.created_at AS payment_created_at "
            "FROM student s "
            "JOIN session_payment_package pkg ON pkg.student_id = s.id "
            "JOIN class c ON c.id = pkg.class_id "
            "LEFT JOIN ( "
            "  SELECT "
            "    student_id, "
            "    class_id, "
            "    FLOOR((MAX(session_number) - 1) / 8) + 1 AS current_package_number "
            "  FROM attendance "
            "  GROUP BY student_id, class_id "
            ") att ON att.student_id = pkg.student_id AND att.class_id = pkg.class_id "
            "LEFT JOIN payment p "
            "  ON p.student_id = s.id "
            " AND p.class_id = pkg.class_id "
            " AND p.package_number = pkg.package_number "
            " AND p.payment_status = 'COMPLETED' "
            " AND p.payment_type = 'STUDENT_FEE' "
            "WHERE pkg.status = 'PAID' "
            "  AND (att.current_package_number IS NULL OR pkg.package_number > att.current_package_number) "
            "ORDER BY s.full_name ASC, class_name ASC, pkg.package_number ASC "
            "LIMIT 20"
        )
    return "SELECT * FROM student LIMIT 1"


# ======================
# TABLE SELECTOR
# ======================
def select_tables(question: str) -> list[str]:
    """
    Table Selector: xác định bảng nào trong DB_SCHEMA có liên quan nhất
    tới câu hỏi để giúp bước sinh SQL tập trung hơn.
    """
    prompt = f"""
Bạn là chuyên gia MySQL, nhiệm vụ của bạn là CHỈ CHỌN CÁC BẢNG liên quan
trong schema dưới đây cho câu hỏi của người dùng.

SCHEMA (tóm tắt):
{DB_SCHEMA}

YÊU CẦU:
- Trả về danh sách tên bảng dạng JSON array, ví dụ:
  ["student", "class", "attendance"]
- KHÔNG giải thích gì thêm ngoài JSON.

CÂU HỎI:
{question}
"""
    text = _call_llm(prompt)
    raw = (text or "").strip()
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return [str(x).strip() for x in data if str(x).strip()]
    except Exception:
        pass
    # Fallback an toàn: không lọc bảng nếu LLM trả về không đúng JSON.
    return []


# ======================
# SQL REVIEWER
# ======================
def review_sql(question: str, sql: str, feedback: str | None = None) -> str:
    """
    SQL Reviewer: dùng LLM để rà soát lại câu lệnh SQL do bước sinh SQL trả về
    (kiểm tra đúng bảng/cột, đủ điều kiện lọc cơ bản, không mâu thuẫn với câu hỏi).
    Chỉ trả về MỘT câu lệnh SELECT cuối cùng.
    """
    feedback_section = f"\nLỖI THỰC THI / FEEDBACK:\n{feedback}\n" if feedback else ""
    prompt = f"""
Bạn là chuyên gia MySQL, nhiệm vụ của bạn là RÀ SOÁT và SỬA CÂU LỆNH SQL dưới đây
cho phù hợp hơn với câu hỏi, dựa trên schema.

SCHEMA:
{DB_SCHEMA}

CÂU HỎI:
{question}

SQL GỐC:
{sql}

{feedback_section}

YÊU CẦU:
- Nếu SQL đã hợp lý → chỉ cần trả lại nguyên câu SQL đó.
- Nếu cần chỉnh sửa (bổ sung điều kiện, chọn đúng bảng/cột) → sửa trực tiếp SQL.
- LUÔN trả về CHÍNH XÁC MỘT câu SELECT duy nhất.
- KHÔNG giải thích gì thêm, KHÔNG bọc ```sql``` – chỉ trả về SQL.
"""
    text = _call_llm(prompt)
    raw = (text or "").strip()
    raw = re.sub(r"(?is)```(?:sql|mysql)?\s*", "", raw)
    raw = re.sub(r"(?is)```", "", raw).strip()
    m = re.search(r"(?is)\bselect\b[\s\S]*?(;|$)", raw)
    if m:
        return _cut_after_first_statement(m.group(0).strip())
    # Nếu LLM trả về linh tinh → fallback dùng SQL gốc
    return sql


# ======================
# REFLEXION AI
# ======================
def reflexion_fix_sql(question: str, sql: str, sample_rows, feedback: str | None = None):
    """
    Reflexion AI: xem thử dữ liệu (LIMIT 5) rồi quyết định có cần chỉnh SQL nữa không.
    Nếu thấy kết quả chưa đúng ý câu hỏi, hãy tự sửa SQL (SELECT duy nhất) và trả lại.
    Nếu thấy ổn thì trả nguyên SQL cũ.
    """
    try:
        data_json = json.dumps(sample_rows, ensure_ascii=False, indent=2)
    except Exception:
        data_json = "null"

    feedback_section = f"\nLỖI THỰC THI / FEEDBACK:\n{feedback}\n" if feedback else ""
    prompt = f"""
Bạn là trợ lý phân tích dữ liệu cho hệ thống quản lý lớp học.

CÂU HỎI:
{question}

SQL HIỆN TẠI:
{sql}

KẾT QUẢ THỬ (tối đa 5 dòng, dạng JSON):
{data_json}

{feedback_section}

NHIỆM VỤ:
- ĐÁNH GIÁ xem kết quả trên đã TRẢ LỜI ĐÚNG câu hỏi chưa.
- Nếu CHƯA ĐÚNG hoặc còn thiếu thông tin quan trọng → hãy SỬA lại câu lệnh SQL để phù hợp hơn.
- Nếu ĐÃ ỔN → giữ nguyên SQL hiện tại.

YÊU CẦU:
- Luôn trả về DUY NHẤT một câu SELECT.
- Không bọc trong ```sql```, không kèm giải thích – CHỈ trả về SQL cuối cùng.
"""
    text = _call_llm(prompt)
    raw = (text or "").strip()
    raw = re.sub(r"(?is)```(?:sql|mysql)?\s*", "", raw)
    raw = re.sub(r"(?is)```", "", raw).strip()
    m = re.search(r"(?is)\bselect\b[\s\S]*?(;|$)", raw)
    if m:
        return _cut_after_first_statement(m.group(0).strip())
    # Nếu không bắt được SELECT nào, giữ nguyên
    return sql


# ======================
# FINAL ANSWER
# ======================
def generate_answer(question, data):

    data_json = json.dumps(data, ensure_ascii=False, indent=2)
    prompt = f"""
Bạn là trợ lý quản lý lớp học, trả lời như con người: thân thiện, tự nhiên, dễ đọc.

DATA:
{data_json}

CÂU HỎI:
{question}

YÊU CẦU:
- Trả lời bằng tiếng Việt, giọng nói giống người thật (có thể mở đầu nhẹ nhàng, dùng từ xưng hô phù hợp).
- Định dạng câu trả lời bằng MARKDOWN:
  - Dùng **in đậm** cho nhãn/tên trường quan trọng (vd: **Họ tên:**, **Email:**).
  - Dùng dấu đầu dòng (- hoặc *) cho danh sách nhiều mục.
  - Dùng xuống dòng giữa các đoạn ngắn cho dễ đọc.
  - Có thể dùng ### cho tiêu đề nhỏ nếu thông tin nhiều nhóm.
- Nếu DATA là mảng rỗng ([]), trả lời ngắn gọn: "Không tìm thấy thông tin phù hợp."
- Nếu DATA có ít nhất 1 phần tử: dùng đúng giá trị trong DATA để trả lời, không bịa; liệt kê từng dòng đúng với từng bản ghi (người A – ngày X, người B – ngày Y).
- Ngày tháng trong câu trả lời phải khớp với DATA (vd: DATA ghi 2026-03-07 thì không ghi 2026-03-09).
- Số tiền trong DATA đã ở dạng VNĐ (vd: "1.500.000 VNĐ"); khi trả lời giữ nguyên đúng chuỗi đó, không đổi sang số thuần hay đơn vị khác.
- Chỉ trả nội dung câu trả lời (markdown), không thêm giải thích meta hay "Đây là kết quả:".
"""

    return _call_llm(prompt)