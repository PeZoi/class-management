package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueByStatusResponse {
    private String status; // PAID, PARTIAL
    private String statusLabel; // "Đã thanh toán đủ", "Chưa thanh toán đủ"
    private Long revenue; // Tổng doanh thu theo trạng thái
    private Long count; // Số lượng giao dịch
}

