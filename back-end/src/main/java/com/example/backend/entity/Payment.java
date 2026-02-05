package com.example.backend.entity;

import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.PaymentType;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends Auditable {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "payment_id", unique = true, nullable = false)
    private String paymentId;

    @Column(nullable = false)
    private Long amount;

    // Snapshot học phí tại thời điểm đóng
    @Column(name = "fee_snapshot", nullable = false)
    private Long feeSnapshot;

    @Column(nullable = false)
    private Long paid; // Số tiền đã đóng

    // Thưởng (chỉ dùng cho teacher salary)
    @Column(name = "bonus")
    private Long bonus;

    // Khấu trừ (chỉ dùng cho teacher salary)
    @Column(name = "deduction")
    private Long deduction;

    // Đại diện cho tháng học phí (ví dụ: 2025-09-01)
    // DEPRECATED: Giữ lại để backward compatibility, sẽ dùng session-based thay thế
    @Column(name = "billing_month")
    private Instant billingMonth;

    // Session-based payment fields (mới)
    @Column(name = "session_start_number")
    private Integer sessionStartNumber; // Buổi bắt đầu của gói thanh toán

    @Column(name = "session_end_number")
    private Integer sessionEndNumber; // Buổi kết thúc của gói thanh toán

    @Column(name = "package_number")
    private Integer packageNumber; // Số thứ tự gói (1, 2, 3...)

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod; // Phương thức đóng tiền

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false)
    private PaymentType paymentType; // Loại tiền

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false)
    private PaymentDirection direction; // Type tiền vô / ra

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private Class clazz;

    @Column(length = 500)
    private String note; // Ghi chú về khoản thanh toán
}