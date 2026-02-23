-- Migration: Performance Optimization Indexes
-- Purpose: Add indexes to improve query performance for payment, student_class tables
-- Date: 2026-02-11
-- 
-- IMPORTANT: Run this migration during off-peak hours
-- Estimated time: 5-10 minutes depending on data volume

-- ===============================
-- PAYMENT TABLE INDEXES
-- ===============================

-- Single column indexes for common WHERE clauses
CREATE INDEX IF NOT EXISTS idx_payment_billing_month ON payment(billing_month);
CREATE INDEX IF NOT EXISTS idx_payment_direction ON payment(direction);
CREATE INDEX IF NOT EXISTS idx_payment_type ON payment(payment_type);
CREATE INDEX IF NOT EXISTS idx_payment_created_at ON payment(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_method ON payment(payment_method);

-- Composite indexes for frequently combined WHERE clauses
-- These improve performance for dashboard and revenue queries
CREATE INDEX IF NOT EXISTS idx_payment_direction_billing ON payment(direction, billing_month);
CREATE INDEX IF NOT EXISTS idx_payment_type_billing ON payment(payment_type, billing_month);
CREATE INDEX IF NOT EXISTS idx_payment_direction_created ON payment(direction, created_at);

-- Foreign key composite indexes for student/teacher/class queries with billing month
CREATE INDEX IF NOT EXISTS idx_payment_student_billing ON payment(student_id, billing_month);
CREATE INDEX IF NOT EXISTS idx_payment_teacher_billing ON payment(teacher_id, billing_month);
CREATE INDEX IF NOT EXISTS idx_payment_class_billing ON payment(class_id, billing_month);

-- Additional composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_payment_direction_created_status ON payment(direction, created_at, payment_status);

-- ===============================
-- STUDENT_CLASS TABLE INDEXES
-- ===============================

-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_student_class_student ON student_class(student_id);
CREATE INDEX IF NOT EXISTS idx_student_class_class ON student_class(class_id);
CREATE INDEX IF NOT EXISTS idx_student_class_shift ON student_class(class_shift_id);
CREATE INDEX IF NOT EXISTS idx_student_class_left_at ON student_class(left_at);
CREATE INDEX IF NOT EXISTS idx_student_class_status ON student_class(status);
CREATE INDEX IF NOT EXISTS idx_student_class_joined_at ON student_class(joined_at);

-- Composite indexes for common queries (find active students in class)
CREATE INDEX IF NOT EXISTS idx_student_class_class_left_status ON student_class(class_id, left_at, status);
CREATE INDEX IF NOT EXISTS idx_student_class_student_left_status ON student_class(student_id, left_at, status);

-- ===============================
-- STUDENT TABLE INDEXES
-- ===============================

-- Index for search queries (fullName, email, phoneNumber already have UNIQUE indexes)
CREATE INDEX IF NOT EXISTS idx_student_created_at ON student(created_at);
CREATE INDEX IF NOT EXISTS idx_student_status ON student(status);
CREATE INDEX IF NOT EXISTS idx_student_full_name ON student(full_name);

-- ===============================
-- VERIFICATION QUERIES
-- ===============================
-- Run these to verify indexes were created:
-- SHOW INDEX FROM payment;
-- SHOW INDEX FROM student_class;
-- SHOW INDEX FROM student;

-- To check index usage:
-- EXPLAIN SELECT * FROM payment WHERE direction = 'INCOME' AND billing_month = '2026-01-01';

