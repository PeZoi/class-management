package com.example.backend.dto.classroom;

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
public class ClassSingleRevenueDataResponse {
    private String month; // "T1", "T2", etc.
    private String label; // "Tháng 1", "Tháng 2", etc.
    private Long revenue; // Revenue cho class này trong tháng này
}

