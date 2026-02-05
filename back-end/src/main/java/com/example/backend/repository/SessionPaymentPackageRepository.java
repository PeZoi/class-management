package com.example.backend.repository;

import com.example.backend.entity.SessionPaymentPackage;
import com.example.backend.enums.SessionPaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionPaymentPackageRepository extends JpaRepository<SessionPaymentPackage, String> {
    // Lấy tất cả packages của một học viên trong một lớp
    List<SessionPaymentPackage> findByStudentIdAndClazzIdOrderByPackageNumberAsc(String studentId, String classId);

    // Lấy package theo package number
    Optional<SessionPaymentPackage> findByStudentIdAndClazzIdAndPackageNumber(String studentId, String classId, Integer packageNumber);

    // Lấy package hiện tại chưa thanh toán đủ (UNPAID hoặc PARTIAL)
    @Query("SELECT p FROM SessionPaymentPackage p WHERE p.student.id = :studentId AND p.clazz.id = :classId AND (p.status = 'UNPAID' OR p.status = 'PARTIAL') ORDER BY p.packageNumber ASC")
    Optional<SessionPaymentPackage> findCurrentUnpaidPackage(@Param("studentId") String studentId, @Param("classId") String classId);

    // Lấy package number lớn nhất
    @Query("SELECT MAX(p.packageNumber) FROM SessionPaymentPackage p WHERE p.student.id = :studentId AND p.clazz.id = :classId")
    Optional<Integer> findMaxPackageNumber(@Param("studentId") String studentId, @Param("classId") String classId);

    // Lấy packages theo status
    List<SessionPaymentPackage> findByStudentIdAndClazzIdAndStatusOrderByPackageNumberAsc(String studentId, String classId, SessionPaymentStatus status);
}

