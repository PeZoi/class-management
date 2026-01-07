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
public class UnpaidMonthInfo {
    private Instant month; // Tháng chưa đóng (ví dụ: 2025-09-01)
    private Long expectedAmount; // Số tiền dự kiến phải đóng
    private Long paidAmount; // Số tiền đã đóng (0 nếu chưa có payment)
    private Long remainingAmount; // Số tiền còn thiếu
    private boolean hasPayment; // Có payment record chưa (true nếu có nhưng chưa đủ, false nếu chưa có)
}

