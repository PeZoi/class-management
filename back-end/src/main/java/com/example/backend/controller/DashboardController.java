package com.example.backend.controller;

import com.example.backend.dto.dashboard.DashboardRevenueDataResponse;
import com.example.backend.dto.dashboard.DashboardStatsResponse;
import com.example.backend.dto.dashboard.RevenueByClassResponse;
import com.example.backend.dto.dashboard.RevenueByPaymentMethodResponse;
import com.example.backend.dto.dashboard.RevenueByStatusResponse;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    public ResponseEntity<List<StudentResponse>> getStudentsWithUnpaidFees(
            @RequestParam(defaultValue = "10") int limit
    ) {
        List<StudentResponse> students = dashboardService.getStudentsWithUnpaidFees(limit);
        return new ResponseEntity<>(students, HttpStatus.OK);
    }

    @GetMapping("/revenue-statistics/by-class/{period}")
    public ResponseEntity<List<RevenueByClassResponse>> getRevenueByClass(@PathVariable(value = "period") String period) {
        List<RevenueByClassResponse> revenueByClass = dashboardService.getRevenueByClass(period);
        return new ResponseEntity<>(revenueByClass, HttpStatus.OK);
    }

    @GetMapping("/revenue-statistics/by-payment-method/{period}")
    public ResponseEntity<List<RevenueByPaymentMethodResponse>> getRevenueByPaymentMethod(@PathVariable(value = "period") String period) {
        List<RevenueByPaymentMethodResponse> revenueByMethod = dashboardService.getRevenueByPaymentMethod(period);
        return new ResponseEntity<>(revenueByMethod, HttpStatus.OK);
    }

    @GetMapping("/revenue-statistics/by-status/{period}")
    public ResponseEntity<List<RevenueByStatusResponse>> getRevenueByStatus(@PathVariable(value = "period") String period) {
        List<RevenueByStatusResponse> revenueByStatus = dashboardService.getRevenueByStatus(period);
        return new ResponseEntity<>(revenueByStatus, HttpStatus.OK);
    }
}

