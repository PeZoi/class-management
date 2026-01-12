package com.example.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalRevenue;
    private Long totalClasses;
    private Long totalStudents;
    private Long totalTeachers;
    private Double revenueGrowth;
    private Double studentGrowth;
}

