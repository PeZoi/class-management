package com.example.backend.dto.student;

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
public class MonthPaymentStatus {
    private Instant month; // Tháng thanh toán (ví dụ: 2025-09-01)
    private Long expectedAmount; // Số tiền dự kiến phải đóng
    private Long paidAmount; // Số tiền đã đóng
    private Long remainingAmount; // Số tiền còn thiếu
    private PaymentStatusEnum status; // Trạng thái: PAID, PARTIAL, UNPAID
    
    public enum PaymentStatusEnum {
        PAID,      // Đã thanh toán đủ
        PARTIAL,   // Đóng một phần
        UNPAID     // Chưa thanh toán
    }
}

