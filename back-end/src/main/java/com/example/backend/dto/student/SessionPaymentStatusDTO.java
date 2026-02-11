package com.example.backend.dto.student;

import com.example.backend.enums.SessionPaymentStatus;
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
public class SessionPaymentStatusDTO {
    private Integer packageNumber; // 1, 2, 3...
    private Integer startSessionNumber; // 1, 9, 17...
    private Integer endSessionNumber; // 8, 16, 24...
    private Long expectedAmount; // monthlyFee
    private Long paidAmount;
    private Long remainingAmount;
    private SessionPaymentStatus status; // PAID, PARTIAL, UNPAID
    private Instant createdAtPackage;
    private Instant completedAt;
    private Boolean isCurrent; // Package đang được sử dụng (dựa trên số buổi đã điểm danh)
}

