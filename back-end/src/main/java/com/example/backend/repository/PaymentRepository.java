package com.example.backend.repository;

import com.example.backend.entity.Payment;
import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.PaymentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    // Lấy payments với class được fetch sẵn (để tránh lazy loading exception)
    @Query("SELECT p FROM Payment p LEFT JOIN FETCH p.clazz WHERE p.direction = :direction AND p.createdAt >= :startDate AND p.createdAt < :endDate")
    List<Payment> findAllByDirectionAndCreatedAtBetweenWithClass(@Param("direction") PaymentDirection direction, @Param("startDate") Instant startDate, @Param("endDate") Instant endDate);

    // ===== PERFORMANCE OPTIMIZATION QUERIES (AGGREGATION) =====
    
    // Tính tổng paid amount theo direction và billing month (thay thế findAll() + stream)
    @Query("""
        SELECT COALESCE(SUM(p.paid), 0) 
        FROM Payment p 
        WHERE p.direction = :direction 
        AND p.billingMonth = :billingMonth
    """)
    Long sumPaidByDirectionAndBillingMonth(
        @Param("direction") PaymentDirection direction, 
        @Param("billingMonth") Instant billingMonth
    );

    // Count distinct students có payment trong tháng (thay thế findAll() + stream)
    @Query("""
        SELECT COUNT(DISTINCT p.student.id) 
        FROM Payment p 
        WHERE p.billingMonth = :billingMonth
        AND p.student IS NOT NULL
    """)
    Long countDistinctStudentsByBillingMonth(@Param("billingMonth") Instant billingMonth);

    // Tính tổng salary theo teacher và billing month - dùng aggregation
    // Returns: List<Object[]> where [0] = teacherId (String), [1] = totalAmount (Long)
    @Query("""
        SELECT p.teacher.id,
               COALESCE(SUM(p.feeSnapshot + COALESCE(p.bonus, 0) - COALESCE(p.deduction, 0)), 0)
        FROM Payment p
        WHERE p.paymentType = 'TEACHER_SALARY'
        AND p.billingMonth = :billingMonth
        AND p.teacher IS NOT NULL
        GROUP BY p.teacher.id
    """)
    List<Object[]> sumSalaryByBillingMonth(@Param("billingMonth") Instant billingMonth);

    // Lấy payments theo direction và created date range - aggregated by payment method
    // Returns: List<Object[]> where [0] = paymentMethod (PaymentMethod), [1] = totalPaid (Long), [2] = count (Long)
    @Query("""
        SELECT p.paymentMethod, 
               COALESCE(SUM(p.paid), 0),
               COUNT(p)
        FROM Payment p
        WHERE p.direction = :direction
        AND p.createdAt >= :startDate
        AND p.createdAt < :endDate
        GROUP BY p.paymentMethod
    """)
    List<Object[]> sumPaymentsByMethodAndDateRange(
        @Param("direction") PaymentDirection direction,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    // Tương tự cho payment status - aggregated by status
    // Returns: List<Object[]> where [0] = paymentStatus (PaymentStatus), [1] = totalPaid (Long), [2] = count (Long)
    @Query("""
        SELECT p.paymentStatus,
               COALESCE(SUM(p.paid), 0),
               COUNT(p)
        FROM Payment p
        WHERE p.direction = :direction
        AND p.createdAt >= :startDate
        AND p.createdAt < :endDate
        GROUP BY p.paymentStatus
    """)
    List<Object[]> sumPaymentsByStatusAndDateRange(
        @Param("direction") PaymentDirection direction,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate
    );

    // ===== PAGINATION SUPPORT FOR PAYMENT TABLE =====
    
    /**
     * Tìm kiếm payments với pagination và filtering support
     * Filter theo: paymentId, direction, paymentType, status, student name, teacher name
     */
    @Query(
        value = """
        SELECT DISTINCT p FROM Payment p
        LEFT JOIN p.student s
        LEFT JOIN p.teacher t
        LEFT JOIN p.clazz c
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(p.paymentId) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(t.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:direction IS NULL OR p.direction = :direction)
        AND (:paymentType IS NULL OR p.paymentType = :paymentType)
        AND (:paymentStatus IS NULL OR p.paymentStatus = :paymentStatus)
        AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod)
        AND (:className IS NULL OR p.clazz.name = :className)
        AND (:startDate IS NULL OR p.createdAt >= :startDate)
        AND (:endDate IS NULL OR p.createdAt <= :endDate)
    """,
        countQuery = """
        SELECT COUNT(DISTINCT p) FROM Payment p
        LEFT JOIN p.student s
        LEFT JOIN p.teacher t
        LEFT JOIN p.clazz c
        WHERE (:search IS NULL OR :search = ''
               OR LOWER(p.paymentId) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(t.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))
        AND (:direction IS NULL OR p.direction = :direction)
        AND (:paymentType IS NULL OR p.paymentType = :paymentType)
        AND (:paymentStatus IS NULL OR p.paymentStatus = :paymentStatus)
        AND (:paymentMethod IS NULL OR p.paymentMethod = :paymentMethod)
        AND (:className IS NULL OR p.clazz.name = :className)
        AND (:startDate IS NULL OR p.createdAt >= :startDate)
        AND (:endDate IS NULL OR p.createdAt <= :endDate)
    """
    )
    Page<Payment> findAllWithFilters(
        @Param("search") String search,
        @Param("direction") PaymentDirection direction,
        @Param("paymentType") PaymentType paymentType,
        @Param("paymentStatus") PaymentStatus paymentStatus,
        @Param("paymentMethod") PaymentMethod paymentMethod,
        @Param("className")  String className,
        @Param("startDate") Instant startDate,
        @Param("endDate") Instant endDate,
        Pageable pageable
    );
}
