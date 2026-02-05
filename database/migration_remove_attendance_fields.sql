-- Migration: Remove classShiftId and checkInTime from attendance table
-- Date: 2026-02-05
-- Description: Xóa các trường không cần thiết: class_shift_id và check_in_time
--              sessionNumber sẽ được tự động tính toán từ sessionDate

-- Step 1: Backup data (optional but recommended)
-- CREATE TABLE attendance_backup AS SELECT * FROM attendance;

-- Step 2: Remove foreign key constraint for class_shift_id (if exists)
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS fk_attendance_class_shift;

-- Step 3: Drop columns
ALTER TABLE attendance DROP COLUMN IF EXISTS class_shift_id;
ALTER TABLE attendance DROP COLUMN IF EXISTS check_in_time;

-- Step 4: Verify the changes
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'attendance'
-- ORDER BY ordinal_position;

-- Expected remaining columns:
-- id, student_id, class_id, session_date, session_number, status, notes, created_at, updated_at, created_by, updated_by

-- Notes:
-- 1. sessionNumber will be auto-calculated by backend based on sessionDate
-- 2. classShiftId is no longer needed as attendance is tracked only by date
-- 3. checkInTime is removed as it's not required for attendance tracking

