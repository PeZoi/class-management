package com.example.backend.controller;

import com.example.backend.dto.dashboard.DashboardRevenueDataResponse;
import com.example.backend.dto.dashboard.DashboardStatsResponse;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }

    @GetMapping("/revenue-data/{period}")
    public ResponseEntity<List<DashboardRevenueDataResponse>> getRevenueDataByPeriod(@PathVariable(value = "period") String period) {
        List<DashboardRevenueDataResponse> revenueData = dashboardService.getRevenueDataByPeriod(period);
        return new ResponseEntity<>(revenueData, HttpStatus.OK);
    }

    @GetMapping("/students-with-unpaid-fees")
    public ResponseEntity<List<StudentResponse>> getStudentsWithUnpaidFees() {
        List<StudentResponse> students = dashboardService.getStudentsWithUnpaidFees();
        return new ResponseEntity<>(students, HttpStatus.OK);
    }
}

