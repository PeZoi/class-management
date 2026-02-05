-- Migration Script: Chuyển đổi từ Monthly Payment sang Session-based Payment
-- Date: 2026-01-17
-- Description: Tạo các bảng mới cho attendance và session payment package

-- ============================================
-- 1. Tạo bảng attendance (điểm danh)
-- ============================================
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `student_id` varchar(255) NOT NULL,
  `class_id` varchar(255) NOT NULL,
  `class_shift_id` varchar(255) DEFAULT NULL,
  `session_date` datetime(6) NOT NULL,
  `session_number` int NOT NULL,
  `status` enum('PRESENT','ABSENT','LATE','EXCUSED') NOT NULL,
  `check_in_time` datetime(6) DEFAULT NULL,
  `notes` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_attendance_student` (`student_id`),
  KEY `FK_attendance_class` (`class_id`),
  KEY `FK_attendance_class_shift` (`class_shift_id`),
  UNIQUE KEY `UK_student_class_session` (`student_id`, `class_id`, `session_number`),
  CONSTRAINT `FK_attendance_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `FK_attendance_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`),
  CONSTRAINT `FK_attendance_class_shift` FOREIGN KEY (`class_shift_id`) REFERENCES `class_shift` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 2. Tạo bảng session_payment_package (gói thanh toán theo buổi)
-- ============================================
CREATE TABLE IF NOT EXISTS `session_payment_package` (
  `id` varchar(255) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `updated_by` varchar(255) DEFAULT NULL,
  `student_id` varchar(255) NOT NULL,
  `class_id` varchar(255) NOT NULL,
  `package_number` int NOT NULL,
  `start_session_number` int NOT NULL,
  `end_session_number` int NOT NULL,
  `expected_amount` bigint NOT NULL,
  `paid_amount` bigint NOT NULL DEFAULT 0,
  `status` enum('PAID','PARTIAL','UNPAID') NOT NULL,
  `created_at_package` datetime(6) DEFAULT NULL,
  `completed_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_package_student` (`student_id`),
  KEY `FK_package_class` (`class_id`),
  UNIQUE KEY `UK_student_class_package` (`student_id`, `class_id`, `package_number`),
  CONSTRAINT `FK_package_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`id`),
  CONSTRAINT `FK_package_class` FOREIGN KEY (`class_id`) REFERENCES `class` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================
-- 3. Cập nhật bảng payment để hỗ trợ session-based payment
-- ============================================
-- Thêm các cột mới (nullable để backward compatibility)
ALTER TABLE `payment` 
  ADD COLUMN IF NOT EXISTS `session_start_number` int DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `session_end_number` int DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS `package_number` int DEFAULT NULL;

-- Làm cho billing_month nullable (giữ lại để backward compatibility)
ALTER TABLE `payment` 
  MODIFY COLUMN `billing_month` datetime(6) DEFAULT NULL;

-- Thêm index cho các cột mới
CREATE INDEX IF NOT EXISTS `IDX_payment_package` ON `payment` (`student_id`, `class_id`, `package_number`);
CREATE INDEX IF NOT EXISTS `IDX_payment_session_range` ON `payment` (`student_id`, `class_id`, `session_start_number`, `session_end_number`);

-- ============================================
-- 4. Migration dữ liệu cũ (Optional - chạy sau khi test)
-- ============================================
-- Note: Script này sẽ chuyển đổi payments cũ từ month-based sang session-based
-- Chỉ chạy sau khi đã test kỹ hệ thống mới

-- Ví dụ: Tạo packages từ payments cũ (cần điều chỉnh logic theo yêu cầu cụ thể)
-- INSERT INTO session_payment_package (id, created_at, student_id, class_id, package_number, start_session_number, end_session_number, expected_amount, paid_amount, status, created_at_package)
-- SELECT 
--   UUID() as id,
--   p.created_at,
--   p.student_id,
--   p.class_id,
--   ROW_NUMBER() OVER (PARTITION BY p.student_id, p.class_id ORDER BY p.billing_month) as package_number,
--   (ROW_NUMBER() OVER (PARTITION BY p.student_id, p.class_id ORDER BY p.billing_month) - 1) * 8 + 1 as start_session_number,
--   ROW_NUMBER() OVER (PARTITION BY p.student_id, p.class_id ORDER BY p.billing_month) * 8 as end_session_number,
--   p.fee_snapshot as expected_amount,
--   COALESCE(SUM(p.paid) OVER (PARTITION BY p.student_id, p.class_id, p.billing_month), 0) as paid_amount,
--   CASE 
--     WHEN COALESCE(SUM(p.paid) OVER (PARTITION BY p.student_id, p.class_id, p.billing_month), 0) >= p.fee_snapshot THEN 'PAID'
--     WHEN COALESCE(SUM(p.paid) OVER (PARTITION BY p.student_id, p.class_id, p.billing_month), 0) > 0 THEN 'PARTIAL'
--     ELSE 'UNPAID'
--   END as status,
--   p.billing_month as created_at_package
-- FROM payment p
-- WHERE p.student_id IS NOT NULL 
--   AND p.billing_month IS NOT NULL
-- GROUP BY p.student_id, p.class_id, p.billing_month, p.fee_snapshot, p.created_at;

-- ============================================
-- 5. Rollback Script (nếu cần)
-- ============================================
-- DROP TABLE IF EXISTS `session_payment_package`;
-- DROP TABLE IF EXISTS `attendance`;
-- ALTER TABLE `payment` 
--   DROP COLUMN IF EXISTS `session_start_number`,
--   DROP COLUMN IF EXISTS `session_end_number`,
--   DROP COLUMN IF EXISTS `package_number`;
-- ALTER TABLE `payment` 
--   MODIFY COLUMN `billing_month` datetime(6) NOT NULL;

