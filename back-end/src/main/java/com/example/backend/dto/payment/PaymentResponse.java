package com.example.backend.dto.payment;

import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.PaymentType;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    private StudentPayment student;
    private TeacherPayment teacher;
    @JsonProperty("class")
    private ClassPayment clazz;
    private String note; // Ghi chú về khoản thanh toán
    private Instant createdAt;
    private Instant updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeacherPayment {
        private String id;
        private String fullName;
        private String gender;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentPayment {
        private String id;
        private String fullName;
        private String gender;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ClassPayment {
        private String id;
        private String name;
    }
}

