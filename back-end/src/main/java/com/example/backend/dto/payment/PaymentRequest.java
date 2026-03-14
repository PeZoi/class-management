package com.example.backend.dto.payment;

import java.time.Instant;

import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentType;

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
public class PaymentRequest {
    private Long amount; // Số tiền còn lại cần đóng (remaining amount) - sẽ được tính lại bởi backend
    private Long paid; // Số tiền đóng trong lần này
    private Long feeSnapshot; // Số tiền thành toán của lớp đó vào thời điểm đó
    private Long bonus; // Thưởng (chỉ dùng cho teacher salary)
    private Long deduction; // Khấu trừ (chỉ dùng cho teacher salary)
    private Instant billingMonth; // DEPRECATED: Giữ lại để backward compatibility
    // Session-based payment fields (mới)
    private Integer packageNumber; // Số thứ tự gói (1, 2, 3...)
    private Integer sessionStartNumber; // Buổi bắt đầu của gói thanh toán
    private Integer sessionEndNumber; // Buổi kết thúc của gói thanh toán
    private PaymentMethod paymentMethod;
    private PaymentType paymentType;
    private PaymentDirection direction;
    private String studentId;
    private String teacherId;
    private String classId;
    private String note; // Ghi chú về khoản thanh toán
}

