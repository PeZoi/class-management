package com.example.backend.repository;

import com.example.backend.entity.Payment;
import com.example.backend.enums.PaymentDirection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, String> {
    
    // Tìm payment theo student và billingMonth (deprecated - chỉ để tương thích, nên dùng findAllByStudentIdAndBillingMonth)
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId AND p.billingMonth = :billingMonth")
    Optional<Payment> findByStudentIdAndBillingMonth(@Param("studentId") String studentId, @Param("billingMonth") Instant billingMonth);
    
    // Lấy tất cả payments của một student trong một tháng cụ thể (để tổng hợp)
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId AND p.billingMonth = :billingMonth ORDER BY p.createdAt ASC")
    List<Payment> findAllByStudentIdAndBillingMonth(@Param("studentId") String studentId, @Param("billingMonth") Instant billingMonth);

    // Lấy tất cả payments của một student và class trong một tháng cụ thể (để tổng hợp)
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId AND p.clazz.id = :classId AND p.billingMonth = :billingMonth ORDER BY p.createdAt ASC")
    List<Payment> findAllByStudentIdAndClassIdAndBillingMonth(@Param("studentId") String studentId, @Param("classId") String classId, @Param("billingMonth") Instant billingMonth);
    
    // Lấy tất cả payments của một student
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId ORDER BY p.billingMonth DESC, p.createdAt DESC")
    List<Payment> findByStudentId(@Param("studentId") String studentId);

    // Lấy tất cả payments của một student và class
    @Query("""
        SELECT p
        FROM Payment p
        WHERE p.student.id = :studentId
          AND p.clazz.id = :classId
          AND (:fromTime IS NULL OR p.createdAt >= :fromTime)
          AND (:toTime IS NULL OR p.createdAt <= :toTime)
        ORDER BY p.billingMonth DESC, p.createdAt DESC
    """)
    List<Payment> findByStudentIdAndClazzId(@Param("studentId") String studentId, @Param("classId") String classId, @Param("fromTime") Instant fromTime, @Param("toTime") Instant toTime);

    // Lấy tất cả payments của một teacher
    @Query("SELECT p FROM Payment p WHERE p.teacher.id = :teacherId ORDER BY p.billingMonth DESC, p.createdAt DESC")
    List<Payment> findByTeacherId(@Param("teacherId") String teacherId);

    // Lấy tất cả payments của một teacher trong một tháng cụ thể (để tổng hợp)
    @Query("SELECT p FROM Payment p WHERE p.teacher.id = :teacherId AND p.billingMonth = :billingMonth ORDER BY p.createdAt ASC")
    List<Payment> findAllByTeacherIdAndBillingMonth(@Param("teacherId") String teacherId, @Param("billingMonth") Instant billingMonth);

    // Lấy tất cả payments, mới nhất trước
    List<Payment> findAllByOrderByCreatedAtDesc();
    
    // Tìm payment theo paymentId
    Optional<Payment> findByPaymentId(String paymentId);

    // Tính tổng số tiền đã thu (collected) và doanh thu (revenue) cho một class từ payments có direction = INCOME
    @Query("SELECT COALESCE(SUM(p.paid), 0) FROM Payment p WHERE p.clazz.id = :classId AND p.direction = :direction")
    Long sumByClassIdAndDirection(@Param("classId") String classId, @Param("direction") PaymentDirection direction);

    // Tính tổng số tiền đã thu (collected) và doanh thu (revenue) cho một class từ payments có direction = INCOME trong tháng hiện tại
    @Query("SELECT COALESCE(SUM(p.paid), 0) FROM Payment p WHERE p.clazz.id = :classId AND p.direction = :direction AND p.billingMonth = :billingMonth")
    Long sumByClassIdAndDirectionAndMonth(@Param("classId") String classId, @Param("direction") PaymentDirection direction, @Param("billingMonth") Instant billingMonth);

    // Tính tổng revenue cho một class trong một tháng cụ thể (direction = INCOME)
    @Query("SELECT COALESCE(SUM(p.paid), 0) FROM Payment p WHERE p.clazz.id = :classId AND p.direction = :direction AND p.billingMonth = :billingMonth")
    Long sumRevenueByClassIdAndMonth(@Param("classId") String classId, @Param("direction") PaymentDirection direction, @Param("billingMonth") Instant billingMonth);
    
    // Tính tổng revenue cho tất cả classes trong một tháng cụ thể (direction = INCOME)
    @Query("SELECT COALESCE(SUM(p.paid), 0) FROM Payment p WHERE p.direction = :direction AND p.billingMonth = :billingMonth")
    Long sumTotalRevenueByMonth(@Param("direction") PaymentDirection direction, @Param("billingMonth") Instant billingMonth);

    // ===== SESSION-BASED PAYMENT QUERIES (NEW) =====
    
    // Lấy tất cả payments của một student theo package number
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId AND p.clazz.id = :classId AND p.packageNumber = :packageNumber ORDER BY p.createdAt ASC")
    List<Payment> findAllByStudentIdAndClassIdAndPackageNumber(@Param("studentId") String studentId, @Param("classId") String classId, @Param("packageNumber") Integer packageNumber);

    // Lấy tất cả payments của một student theo session range
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId AND p.clazz.id = :classId AND p.sessionStartNumber = :startSession AND p.sessionEndNumber = :endSession ORDER BY p.createdAt ASC")
    List<Payment> findAllByStudentIdAndClassIdAndSessionRange(@Param("studentId") String studentId, @Param("classId") String classId, @Param("startSession") Integer startSession, @Param("endSession") Integer endSession);
}
