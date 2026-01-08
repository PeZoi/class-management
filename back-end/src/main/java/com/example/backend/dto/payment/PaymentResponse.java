package com.example.backend.dto.payment;

import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private String id;
    private String paymentId;
    private Long amount;
    private Long feeSnapshot;
    private Long paid;
    private Instant billingMonth;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private PaymentType paymentType;
    private PaymentDirection direction;
    private String studentId;
    private String teacherId;
    private String classId;
    private String note; // Ghi chú về khoản thanh toán
    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;
}

