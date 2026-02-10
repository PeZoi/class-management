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
public class RevenueByClassResponse {
    private String classId;
    private String className;
    private Long revenue; // Tổng doanh thu của lớp (theo ngày thanh toán)
}

