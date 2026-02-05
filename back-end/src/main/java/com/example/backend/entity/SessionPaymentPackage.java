package com.example.backend.entity;

import com.example.backend.enums.SessionPaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "session_payment_package")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionPaymentPackage extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Class clazz;

    @Column(name = "package_number", nullable = false)
    private Integer packageNumber; // Số thứ tự gói (1, 2, 3...)

    @Column(name = "start_session_number", nullable = false)
    private Integer startSessionNumber; // Buổi bắt đầu (1, 9, 17...)

    @Column(name = "end_session_number", nullable = false)
    private Integer endSessionNumber; // Buổi kết thúc (8, 16, 24...)

    @Column(name = "expected_amount", nullable = false)
    private Long expectedAmount; // Số tiền cần đóng (monthlyFee)

    @Column(name = "paid_amount", nullable = false)
    private Long paidAmount; // Số tiền đã đóng

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SessionPaymentStatus status; // PAID, PARTIAL, UNPAID

    @Column(name = "created_at_package")
    private Instant createdAtPackage; // Thời điểm tạo gói

    @Column(name = "completed_at")
    private Instant completedAt; // Thời điểm hoàn thành thanh toán
}

