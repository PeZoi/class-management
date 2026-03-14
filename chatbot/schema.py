DB_SCHEMA = """
CLASS MANAGEMENT SYSTEM DATABASE

IMPORTANT:
- Use EXACT column names below.
- Enum values are UPPERCASE and must be used exactly as listed.
- Tables `class` and `user` are reserved words in some SQL dialects; in queries prefer backticks: `class`, `user`.

TABLE attendance (
  id varchar(255) PK,
  created_at datetime(6) NOT NULL,
  created_by varchar(255) NULL,
  updated_at datetime(6) NULL,
  updated_by varchar(255) NULL,
  check_in_time datetime(6) NULL,
  notes varchar(500) NULL,
  session_date datetime(6) NOT NULL,
  session_number int NOT NULL,
  status enum('ABSENT','EXCUSED','LATE','PRESENT') NOT NULL,
  class_shift_id varchar(255) NULL  FK -> class_shift.id,
  class_id varchar(255) NOT NULL   FK -> class.id,
  student_id varchar(255) NOT NULL FK -> student.id
)

TABLE audit_log (
  id bigint PK AUTO_INCREMENT,
  action varchar(255) NULL,                 -- action name
  api_description_key varchar(100) NULL,    -- key for UI/i18n
  created_at datetime(6) NOT NULL,
  details longtext NULL,                    -- JSON/string payload
  ip_address varchar(100) NULL,
  method varchar(20) NULL,                  -- HTTP method
  path varchar(500) NULL,                   -- endpoint path
  success bit(1) NULL,                      -- 0/1
  username varchar(100) NULL,
  status_code int NULL
)

TABLE class (
  id varchar(255) PK,
  created_at datetime(6) NOT NULL,
  updated_at datetime(6) NULL,
  monthly_fee int NOT NULL,
  name varchar(45) NOT NULL,
  teacher_id varchar(255) NULL FK -> user.id,
  created_by varchar(255) NULL,
  updated_by varchar(255) NULL,
  schedule varchar(255) NULL,
  description varchar(255) NULL,
  deleted_at datetime(6) NULL,
  deleted_by varchar(255) NULL,
  is_deleted bit(1) NULL                   -- soft-delete flag (0/1/NULL)
)

TABLE class_shift (
  id varchar(255) PK,
  created_at datetime(6) NOT NULL,
  created_by varchar(255) NULL,
  updated_at datetime(6) NULL,
  updated_by varchar(255) NULL,
  name varchar(100) NOT NULL,              -- shift label (VD: "Ca sang - T2, T4, T6 - 19:00 - 21:30")
  class_id varchar(255) NOT NULL FK -> class.id
)

TABLE notification (
  id bigint PK AUTO_INCREMENT,
  is_read bit(1) NULL,
  message text NULL,
  time datetime(6) NOT NULL,
  title varchar(255) NULL,
  type varchar(20) NULL                    -- VD: "warning", "success"
)

TABLE payment (
  id varchar(255) PK,
  amount bigint NOT NULL,
  billing_month datetime(6) NOT NULL,
  direction enum('EXPENSE','INCOME') NOT NULL,
  fee_snapshot bigint NOT NULL,
  paid bigint NOT NULL,
  payment_id varchar(255) NOT NULL UNIQUE, -- business id like INC-...
  payment_method enum('BANK_TRANSFER','CASH') NOT NULL,
  payment_status enum('CANCELLED','COMPLETED','INCOMPLETE') NOT NULL,
  payment_type enum('REFUND','STUDENT_FEE','TEACHER_SALARY') NOT NULL,
  class_id varchar(255) NULL   FK -> class.id,
  student_id varchar(255) NULL FK -> student.id,
  teacher_id varchar(255) NULL FK -> user.id,
  created_at datetime(6) NOT NULL,
  created_by varchar(255) NULL,
  updated_at datetime(6) NULL,
  updated_by varchar(255) NULL,
  note varchar(500) NULL,
  bonus bigint NULL,
  deduction bigint NULL,
  package_number int NULL,
  session_end_number int NULL,
  session_start_number int NULL
)

TABLE role (
  id bigint PK AUTO_INCREMENT,
  name varchar(255) NOT NULL                -- VD: ROLE_ADMIN, ROLE_TEACHER
)

TABLE session_payment_package (
  id varchar(255) PK,
  created_at datetime(6) NOT NULL,
  created_by varchar(255) NULL,
  updated_at datetime(6) NULL,
  updated_by varchar(255) NULL,
  completed_at datetime(6) NULL,
  created_at_package datetime(6) NULL,
  end_session_number int NOT NULL,
  expected_amount bigint NOT NULL,
  package_number int NOT NULL,
  paid_amount bigint NOT NULL,
  start_session_number int NOT NULL,
  status enum('PAID','PARTIAL','UNPAID') NOT NULL,
  class_id varchar(255) NOT NULL   FK -> class.id,
  student_id varchar(255) NOT NULL FK -> student.id
)

TABLE student (
  id varchar(255) PK,
  created_at datetime(6) NOT NULL,
  created_by varchar(255) NULL,
  updated_at datetime(6) NULL,
  updated_by varchar(255) NULL,
  dob datetime(6) NULL,
  email varchar(30) NOT NULL UNIQUE,
  full_name varchar(45) NOT NULL,
  full_name_parent varchar(45) NOT NULL,
  gender enum('FEMALE','MALE','OTHER') NULL,
  phone_number varchar(30) NOT NULL UNIQUE,
  phone_number_parent varchar(30) NOT NULL UNIQUE,
  status enum('ACTIVE','DELETED','GRADUATED','INACTIVE') NULL,
  deleted_at datetime(6) NULL,
  deleted_by varchar(255) NULL
)

TABLE student_class (
  id bigint PK AUTO_INCREMENT,
  created_at datetime(6) NOT NULL,
  created_by varchar(255) NULL,
  updated_at datetime(6) NULL,
  updated_by varchar(255) NULL,
  joined_at datetime(6) NOT NULL,
  left_at datetime(6) NULL,
  status enum('CHANGING','COMPLETED','DROPPED','STUDYING') NOT NULL,
  class_id varchar(255) NOT NULL       FK -> class.id,
  student_id varchar(255) NOT NULL     FK -> student.id,
  shift_name varchar(100) NULL,        -- duplicated shift label (optional)
  class_shift_id varchar(255) NULL     FK -> class_shift.id
)

TABLE user (
  id varchar(255) PK,
  created_at datetime(6) NOT NULL,
  updated_at datetime(6) NULL,
  avatar varchar(100) NULL,
  email varchar(30) NOT NULL UNIQUE,
  enabled bit(1) NOT NULL,
  full_name varchar(45) NOT NULL,
  id_card varchar(45) NOT NULL UNIQUE,
  password varchar(255) NULL,
  phone_number varchar(30) NOT NULL UNIQUE,
  status enum('ACTIVE','BLOCKED','DELETED') NULL,
  username varchar(30) NOT NULL UNIQUE,
  role_id bigint NULL FK -> role.id,
  created_by varchar(255) NULL,
  updated_by varchar(255) NULL,
  gender enum('FEMALE','MALE','OTHER') NULL,
  dob datetime(6) NULL
)

RELATIONSHIPS (most-used):
- class.teacher_id -> user.id
- class_shift.class_id -> class.id
- attendance.student_id -> student.id
- attendance.class_id -> class.id
- attendance.class_shift_id -> class_shift.id
- student_class.student_id -> student.id
- student_class.class_id -> class.id
- student_class.class_shift_id -> class_shift.id
- session_payment_package.student_id -> student.id
- session_payment_package.class_id -> class.id
- payment.student_id -> student.id (nullable)
- payment.teacher_id -> user.id (nullable)
- payment.class_id -> class.id (nullable)
- user.role_id -> role.id

BUSINESS NOTES (confirmed):
- "Hoc sinh tam nghi" = student.status = 'INACTIVE'.
- "Hoc sinh dang hoc" (in a class) = student_class.status = 'STUDYING' and student_class.left_at IS NULL.

SOFT DELETE NOTES:
- Active classes: COALESCE(class.is_deleted, 0) = 0 (and class.deleted_at IS NULL if you want stricter).
- Deleted classes: class.is_deleted = 1 OR class.deleted_at IS NOT NULL.
"""
