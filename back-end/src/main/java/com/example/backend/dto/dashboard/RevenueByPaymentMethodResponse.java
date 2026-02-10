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
public class RevenueByPaymentMethodResponse {
    private String paymentMethod; // CASH, BANK_TRANSFER, CREDIT_CARD, E_WALLET
    private String paymentMethodLabel; // "Tiền mặt", "Chuyển khoản", etc.
    private Long revenue; // Tổng doanh thu theo phương thức thanh toán
    private Long count; // Số lượng giao dịch
}

