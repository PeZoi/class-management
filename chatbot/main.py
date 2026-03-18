import sys
import re
from datetime import date, datetime
from decimal import Decimal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ai import (
    generate_sql,
    generate_answer,
    check_domain,
    LLMQuotaError,
    select_tables,
    review_sql,
    reflexion_fix_sql,
)

from validator import validate_sql
from db import execute_query

# Ensure Windows console can print Vietnamese/UTF-8 safely (avoid UnicodeEncodeError).
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")  # Python 3.7+
except Exception:
    pass

app = FastAPI()

# CORS: cho phép mọi origin truy cập (front-end, mobile, bên thứ ba)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,  # bắt buộc False khi allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Các tên cột/cặp key trong data thường là số tiền → format VNĐ
_MONEY_KEYS = frozenset({
    "amount", "paid", "expected_amount", "paid_amount", "fee_snapshot",
    "monthly_fee", "bonus", "deduction", "thu", "chi",
    "tong_con_no", "total", "so_tien", "hoc_phi", "doanh_thu",
})


def _format_vnd(value) -> str:
    """Chuyển số thành chuỗi định dạng VNĐ (dấu chấm phân cách hàng nghìn)."""
    if value is None:
        return "0 VNĐ"
    try:
        n = int(float(value))
    except (TypeError, ValueError):
        return str(value)
    if n < 0:
        return f"-{_format_vnd(-n)}"
    s = str(n)
    parts = []
    while len(s) > 3:
        parts.append(s[-3:])
        s = s[:-3]
    if s:
        parts.append(s)
    return ".".join(reversed(parts)) + " VNĐ"


def _format_money_in_data(obj):
    """Đệ quy format các trường tiền trong data (dict/list) thành chuỗi VNĐ."""
    if isinstance(obj, list):
        return [_format_money_in_data(item) for item in obj]
    if isinstance(obj, dict):
        return {
            k: _format_vnd(v) if (k.lower() in _MONEY_KEYS and isinstance(v, (int, float, Decimal))) else _format_money_in_data(v)
            for k, v in obj.items()
        }
    return obj


def _json_serializable(obj):
    """Chuyển datetime, date, Decimal trong data từ MySQL thành dạng JSON-serializable."""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, dict):
        return {k: _json_serializable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_json_serializable(v) for v in obj]
    return obj


def _format_dates_in_answer(text: str) -> str:
    """Thay chuỗi ngày giờ dạng ISO bằng dạng dễ đọc: ngày dd tháng mm năm yyyy, HH:mm."""
    if not text or not text.strip():
        return text

    def replace_iso(match):
        s = match.group(0)
        try:
            if len(s) > 26:
                s = s[:26]
            dt = datetime.fromisoformat(s.replace("Z", "+00:00"))
            return dt.strftime("ngày %d tháng %m năm %Y, %H:%M")
        except Exception:
            return match.group(0)

    def replace_date_only(match):
        s = match.group(0)
        try:
            d = datetime.strptime(s, "%Y-%m-%d")
            return d.strftime("ngày %d tháng %m năm %Y")
        except Exception:
            return match.group(0)

    # ISO datetime: 2026-01-06T02:03:54 hoặc 2026-01-06T02:03:54.024466
    text = re.sub(
        r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z)?",
        replace_iso,
        text,
    )
    # Chỉ ngày: 2026-01-06 (tránh trùng với phần đã thay T... ở trên)
    text = re.sub(r"\d{4}-\d{2}-\d{2}(?!T)", replace_date_only, text)
    return text


def _try_build_teacher_class_answer(data) -> str | None:
    if not isinstance(data, list) or not data:
        return None
    if not isinstance(data[0], dict):
        return None

    keys = data[0].keys()
    required = {"teacher_id", "teacher_name", "class_name"}
    if not required.issubset(keys):
        return None

    total_teachers = None
    for row in data:
        if isinstance(row, dict) and "total_teachers" in row and row["total_teachers"] is not None:
            try:
                total_teachers = int(row["total_teachers"])
                break
            except Exception:
                pass

    teachers: dict[str, dict] = {}
    for row in data:
        if not isinstance(row, dict):
            continue
        tid = str(row.get("teacher_id") or "").strip()
        if not tid:
            continue
        tname = str(row.get("teacher_name") or "").strip()
        cname = row.get("class_name")
        cname = (str(cname).strip() if cname is not None else "")

        teachers.setdefault(tid, {"name": tname, "classes": set()})
        if cname:
            teachers[tid]["classes"].add(cname)

    if total_teachers is None:
        total_teachers = len(teachers)

    lines = [f"**Số lượng giáo viên trong hệ thống:** {total_teachers}", "", "**Giáo viên và lớp đang dạy:**"]
    for t in teachers.values():
        cls = sorted(t["classes"])
        if cls:
            lines.append(f"- {t['name']} – {', '.join(cls)}")
        else:
            lines.append(f"- {t['name']} – (chưa có lớp)")
    return "\n".join(lines).strip()


def _try_build_revenue_answer(question: str, data) -> str | None:
    """
    Trả lời nhanh cho câu hỏi doanh thu/thu-chi mà không cần gọi LLM.
    Hữu ích khi LLM bị quota hoặc người dùng chỉ cần số liệu.
    """
    if not isinstance(data, list) or not data or not isinstance(data[0], dict):
        return None
    q = (question or "").lower()
    row0 = data[0]

    if "doanh thu" in q and "doanh_thu" in row0:
        v = row0.get("doanh_thu")
        if isinstance(v, str) and v.strip():
            return f"**Doanh thu tháng này:** {v}"
        return "**Doanh thu tháng này:** 0 VNĐ"

    if ("thu" in q and "chi" in q) and ("thu" in row0 or "chi" in row0):
        thu = row0.get("thu") or "0 VNĐ"
        chi = row0.get("chi") or "0 VNĐ"
        return "\n".join(
            [
                "**Thu và chi trong tháng:**",
                f"- **Thu:** {thu}",
                f"- **Chi:** {chi}",
            ]
        ).strip()

    return None

_IN_SCOPE_KEYWORDS = [
    "lớp",
    "lop",
    "học sinh",
    "hoc sinh",
    "giáo viên",
    "giao vien",
    "điểm danh",
    "diem danh",
    "học phí",
    "hoc phi",
    "thanh toán",
    "thanh toan",
    "attendance",
    "payment",
    "student",
    "class",
    "teacher",
    "email",  # tra cứu theo email: "ai là người có email x@y.com", "thông tin email ..."
]


def _looks_like_vietnamese_name(s: str) -> bool:
    # Heuristic: 2+ words, mostly letters/spaces, contains at least one non-ASCII (diacritics)
    t = (s or "").strip()
    if len(t.split()) < 2:
        return False
    if not re.fullmatch(r"[A-Za-zÀ-ỹ0-9\s\-\u202f\u00a0]+", t):
        return False
    return any(ord(ch) > 127 for ch in t)


def _should_force_in_scope(question: str) -> bool:
    q = (question or "").lower()
    if any(k in q for k in _IN_SCOPE_KEYWORDS):
        return True
    # If the user is asking about "thông tin chi tiết về <Name>" treat as in-scope.
    m = re.search(r"thông tin chi tiết về\s+(.+)$", q)
    if m and _looks_like_vietnamese_name(m.group(1)):
        return True
    return _looks_like_vietnamese_name(question)


_HELP_INTRO_ANSWER = """Tôi là trợ lý hệ thống quản lý lớp học. Tôi có thể giúp bạn:

- **Lớp học:** danh sách lớp, thông tin lớp, học sinh trong lớp
- **Giáo viên:** danh sách giáo viên, giáo viên dạy lớp nào, thông tin liên hệ
- **Học sinh:** danh sách học sinh, lớp đang học, điểm danh
- **Điểm danh / học phí / thanh toán:** tra cứu theo nhu cầu

Bạn hãy đặt câu hỏi cụ thể, ví dụ:

- "Cho tôi danh sách giáo viên và lớp đang dạy"
- "Hiện tại đang có bao nhiêu lớp hoạt động?"
- "Danh sách học viên đang còn mắc nợ?"""

# Câu hỏi dạng "bạn giúp được gì / bạn có thể giúp gì / bạn làm được gì" → trả intro, không cần gọi SQL/LLM
_HELP_PATTERNS = re.compile(
    r"bạn\s+(có\s+thể\s+)?(giúp|hỗ\s+trợ|làm)\s+(gì|được\s+gì|cho\s+tôi)|"
    r"bạn\s+giúp\s+(được\s+)?gì|bạn\s+làm\s+được\s+gì|"
    r"bạn\s+biết\s+(những\s+)?gì|bạn\s+có\s+chức\s+năng\s+gì|"
    r"bạn\s+có\s+tác\s+dụng\s+gì",
    re.IGNORECASE,
)


def _is_help_question(question: str) -> bool:
    q = (question or "").strip()
    if len(q) < 10:
        return False
    return bool(_HELP_PATTERNS.search(q))


_GREETINGS = [
    "xin chào",
    "chào bạn",
    "chao ban",
    "hello",
    "hi",
    "chào ad",
    "chào anh",
    "chào chị",
]


def _is_short_greeting(question: str) -> bool:
    q = (question or "").strip().lower()
    if not q:
        return False
    # Chỉ coi là lời chào khi câu rất ngắn, không có dấu hỏi.
    if len(q) > 40:
        return False
    if "?" in q:
        return False
    # Tránh match kiểu "hi" nằm trong "tháng này" (substring). Chỉ match theo từ/cụm từ riêng.
    q_norm = re.sub(r"\s+", " ", q).strip()
    tokens = set(re.findall(r"[a-zà-ỹ]+", q_norm))
    for g in _GREETINGS:
        g_norm = re.sub(r"\s+", " ", g.strip().lower())
        # cụm nhiều từ: match theo word-boundary
        if " " in g_norm:
            if re.search(rf"(?<!\w){re.escape(g_norm)}(?!\w)", q_norm):
                return True
        else:
            if g_norm in tokens:
                return True
    return False


class ChatRequest(BaseModel):
    message: str


@app.post("/chat")
def chat(req: ChatRequest):

    question = req.message
    print(f"[chat] received len={len(question)}")

    try:
        # 0️⃣ Câu hỏi dạng "bạn giúp được gì?" → trả intro cố định, không tốn LLM/SQL
        if _is_help_question(question):
            return {"answer": _HELP_INTRO_ANSWER, "sql": None, "data": None}

        # 0.5️⃣ Câu chào ngắn gọn ("xin chào", "chào bạn", "hello"...) → trả lời thân thiện, không gọi LLM/SQL
        if _is_short_greeting(question):
            return {
                "answer": (
                    "Xin chào bạn! 👋\n\n"
                    "Mình là trợ lý hệ thống quản lý lớp học. "
                    "Bạn có thể hỏi về **lớp học, giáo viên, học viên, điểm danh, học phí, thanh toán**.\n\n"
                    "Ví dụ:\n"
                    "- \"Cho tôi danh sách giáo viên và lớp đang dạy\"\n"
                    "- \"Lớp 10A1 có những học sinh nào?\"\n"
                    "- \"Học viên nào đang còn nợ tiền?\""
                ),
                "sql": None,
                "data": None,
            }

        # 1️⃣ Domain check
        domain = check_domain(question)

        if "OUT_OF_SCOPE" in domain and not _should_force_in_scope(question):
            return {
                "answer":
                "Tôi chỉ hỗ trợ câu hỏi liên quan hệ thống quản lý lớp học. "
                "Bạn có thể hỏi: danh sách lớp, giáo viên, học sinh, điểm danh, học phí. "
                "Ví dụ: \"Cho tôi danh sách giáo viên và lớp đang dạy\".",
                "sql": None,
                "data": None,
            }

        # 2️⃣ Table Selector
        tables = select_tables(question)

        # 3️⃣ SQL Generator
        sql = generate_sql(question)
        print("AI SQL:", sql)

        # 4️⃣ SQL Reviewer
        sql = review_sql(question, sql)
        print("Reviewed SQL:", sql)

        # 5️⃣ Trial Execute (LIMIT 5) + Reflexion AI (loop ≤ 3)
        def _with_limit(sql_text: str, n: int) -> str:
            """
            Force a single trailing LIMIT n for MySQL.
            Removes an existing trailing LIMIT clause if present (LIMIT x / LIMIT x,y / LIMIT x OFFSET y).
            """
            s = (sql_text or "").strip()
            if s.endswith(";"):
                s = s[:-1].rstrip()
            # Remove ONLY the trailing LIMIT clause (avoid touching subqueries).
            s = re.sub(
                r"(?is)\s+\blimit\b\s+\d+\s*(?:,\s*\d+\s*)?(?:\boffset\b\s+\d+\s*)?$",
                "",
                s,
            ).rstrip()
            return f"{s} LIMIT {n}"

        trial_sql = _with_limit(sql, 5)

        current_sql = sql
        last_feedback: str | None = None
        for _ in range(3):
            try:
                trial_data = execute_query(trial_sql)
                current_sql_new = reflexion_fix_sql(question, current_sql, trial_data, last_feedback)
                last_feedback = None
            except Exception as e:
                # If trial execution fails (unknown table/column/syntax), ask reviewer to fix SQL.
                last_feedback = str(e)
                current_sql_new = review_sql(question, current_sql, feedback=last_feedback)

            if current_sql_new.strip() == current_sql.strip():
                break
            current_sql = current_sql_new
            # Cập nhật trial_sql cho vòng sau (vẫn giữ LIMIT 5)
            trial_sql = _with_limit(current_sql, 5)

        # 6️⃣ Final Execute (sau validator)
        safe_sql = validate_sql(current_sql)
        data = execute_query(safe_sql)
        # Chuẩn hóa datetime/Decimal để json.dumps trong generate_answer và response không lỗi
        data_clean = _json_serializable(data) if data is not None else None
        # Format các trường tiền thành VNĐ (số có dấu chấm + " VNĐ")
        if data_clean is not None:
            data_clean = _format_money_in_data(data_clean)

        # 5️⃣ Generate answer
        fast_answer = _try_build_revenue_answer(question, data_clean)
        if fast_answer:
            answer = fast_answer
        else:
            answer = generate_answer(question, data_clean)
        auto_answer = _try_build_teacher_class_answer(data_clean)
        if auto_answer:
            answer = auto_answer
        if data_clean and answer.strip().lower().startswith("không tìm thấy"):
            row0 = data_clean[0] if isinstance(data_clean, list) and data_clean else {}
            if isinstance(row0, dict) and ("full_name" in row0 or "email" in row0):
                name = row0.get("full_name") or ""
                email = row0.get("email") or ""
                answer = f"Giáo viên: {name} ({email})".strip()

        answer = _format_dates_in_answer(answer)

        return {
            "answer": answer,
            "sql": safe_sql,
            "data": data_clean,
        }

    except Exception as e:
        msg = str(e)
        if isinstance(e, LLMQuotaError) or ("Quota exceeded" in msg) or ("429" in msg):
            return {
                "answer": (
                    "Hiện tại hệ thống AI đang bị giới hạn quota nên chưa trả lời được. "
                    "Bạn hãy kiểm tra billing/quota của Groq (GROQ_API_KEY)."
                )
            }
        if "Unsafe SQL" in msg or "unsafe sql" in msg.lower():
            return {
                "answer": (
                    "Câu hỏi của bạn khiến AI sinh ra câu lệnh SQL không an toàn nên đã bị chặn. "
                    "Vui lòng chỉ hỏi các truy vấn **xem dữ liệu** (danh sách, thống kê, tra cứu) "
                    "liên quan lớp học, giáo viên, học viên, điểm danh, học phí."
                ),
                "sql": None,
                "data": None,
            }
        return {"answer": msg}