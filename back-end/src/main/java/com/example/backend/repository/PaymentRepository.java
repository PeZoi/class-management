package com.example.backend.repository;

import com.example.backend.entity.Payment;
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
    
    // Lấy tất cả payments của một student
    @Query("SELECT p FROM Payment p WHERE p.student.id = :studentId ORDER BY p.billingMonth DESC, p.createdAt DESC")
    List<Payment> findByStudentId(@Param("studentId") String studentId);

    // Lấy tất cả payments, mới nhất trước
    List<Payment> findAllByOrderByCreatedAtDesc();
}
