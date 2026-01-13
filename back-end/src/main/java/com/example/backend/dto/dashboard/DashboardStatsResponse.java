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
    private Long totalSalaryExpense; // Tổng lương giáo viên cần trả trong tháng này
    private Double revenueGrowth;
    private Double studentGrowth;
    private Double salaryExpenseGrowth; // % tăng trưởng lương so với tháng trước
}

