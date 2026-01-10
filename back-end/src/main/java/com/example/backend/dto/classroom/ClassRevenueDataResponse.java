package com.example.backend.dto.classroom;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassRevenueDataResponse {
    private String month; // "T1", "T2", etc.
    private String label; // "Tháng 1", "Tháng 2", etc.
    private Map<String, Long> classRevenues; // Map<"class_1", revenue>, Map<"class_2", revenue>, etc.
}

