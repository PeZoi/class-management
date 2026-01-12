package com.example.backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.dashboard.DashboardRevenueDataResponse;
import com.example.backend.dto.dashboard.DashboardStatsResponse;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.Status;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final PaymentRepository paymentRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final StudentService studentService;

    public DashboardStatsResponse getDashboardStats() {
        // Get current month start
        Instant currentMonthStart = getCurrentMonthStart();
        // Get previous month start
        Instant previousMonthStart = getPreviousMonthStart();

        // Total Classes
        Long totalClasses = classRepository.count();

        // Total Students
        Long totalStudents = studentRepository.count();

        // Total Teachers (ROLE_TEACHER and status != DELETED)
        Long totalTeachers = userRepository.findAll().stream()
                .filter(user -> Objects.equals(user.getRole().getName(), "ROLE_TEACHER"))
                .filter(user -> user.getStatus() != Status.DELETED)
                .count();

        // Revenue this month (Total Revenue = current month revenue)
        Long currentMonthRevenue = paymentRepository.findAll().stream()
                .filter(payment -> payment.getDirection() == PaymentDirection.INCOME)
                .filter(payment -> payment.getBillingMonth() != null && 
                        payment.getBillingMonth().equals(currentMonthStart))
                .mapToLong(payment -> payment.getPaid() != null ? payment.getPaid() : 0L)
                .sum();

        // Revenue previous month
        Long previousMonthRevenue = paymentRepository.findAll().stream()
                .filter(payment -> payment.getDirection() == PaymentDirection.INCOME)
                .filter(payment -> payment.getBillingMonth() != null && 
                        payment.getBillingMonth().equals(previousMonthStart))
                .mapToLong(payment -> payment.getPaid() != null ? payment.getPaid() : 0L)
                .sum();

        // Calculate revenue growth
        Double revenueGrowth = calculateGrowth(currentMonthRevenue, previousMonthRevenue);

        // Students with payments this month (unique students) - Total Students = current month students
        Long currentMonthStudents = paymentRepository.findAll().stream()
                .filter(payment -> payment.getBillingMonth() != null && 
                        payment.getBillingMonth().equals(currentMonthStart))
                .map(payment -> payment.getStudent() != null ? payment.getStudent().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        // Students with payments previous month (unique students)
        Long previousMonthStudents = paymentRepository.findAll().stream()
                .filter(payment -> payment.getBillingMonth() != null && 
                        payment.getBillingMonth().equals(previousMonthStart))
                .map(payment -> payment.getStudent() != null ? payment.getStudent().getId() : null)
                .filter(Objects::nonNull)
                .distinct()
                .count();

        // Calculate student growth
        Double studentGrowth = calculateGrowth(currentMonthStudents, previousMonthStudents);

        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setTotalRevenue(currentMonthRevenue); // Doanh thu tháng hiện tại
        response.setTotalClasses(totalClasses);
        response.setTotalStudents(totalStudents);
        response.setTotalTeachers(totalTeachers);
        response.setRevenueGrowth(revenueGrowth);
        response.setStudentGrowth(studentGrowth);

        return response;
    }

    private Instant getCurrentMonthStart() {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.withDayOfMonth(1);
        return firstDayOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private Instant getPreviousMonthStart() {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfCurrentMonth = now.withDayOfMonth(1);
        LocalDate firstDayOfPreviousMonth = firstDayOfCurrentMonth.minusMonths(1);
        return firstDayOfPreviousMonth.atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private Double calculateGrowth(Long current, Long previous) {
        if (previous == null || previous == 0) {
            return current != null && current > 0 ? 100.0 : 0.0;
        }
        if (current == null) {
            return -100.0;
        }
        return ((double) (current - previous) / previous) * 100.0;
    }

    public List<DashboardRevenueDataResponse> getRevenueDataByPeriod(String period) {
        LocalDate now = LocalDate.now();
        int monthsToInclude;

        // Xác định số tháng cần lấy dữ liệu
        switch (period) {
            case "3months":
                monthsToInclude = 3;
                break;
            case "6months":
                monthsToInclude = 6;
                break;
            case "12months":
                monthsToInclude = 12;
                break;
            default:
                monthsToInclude = 6;
        }

        List<DashboardRevenueDataResponse> revenueDataList = new ArrayList<>();

        // Tạo danh sách các tháng cần lấy dữ liệu (từ tháng hiện tại ngược lại)
        for (int i = monthsToInclude - 1; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            LocalDate firstDayOfMonth = targetDate.withDayOfMonth(1);
            Instant billingMonth = firstDayOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant();

            // Tính tổng revenue cho tất cả classes trong tháng này
            Long revenue = paymentRepository.sumTotalRevenueByMonth(PaymentDirection.INCOME, billingMonth);
            if (revenue == null) {
                revenue = 0L;
            }

            // Tạo label cho tháng
            String monthShort = "T" + targetDate.getMonthValue();
            String monthLabel = "Tháng " + targetDate.getMonthValue();

            DashboardRevenueDataResponse revenueData = DashboardRevenueDataResponse.builder()
                    .month(monthShort)
                    .label(monthLabel)
                    .revenue(revenue)
                    .build();

            revenueDataList.add(revenueData);
        }

        return revenueDataList;
    }

    /**
     * Lấy danh sách học sinh chưa đóng tiền, sắp xếp theo số tháng nợ giảm dần
     * @return Danh sách học sinh có nợ
     */
    public List<StudentResponse> getStudentsWithUnpaidFees() {
        // Lấy tất cả học sinh với monthPaymentStatuses
        List<StudentResponse> allStudents = studentService.getAll();
        
        // Filter những học sinh có nợ (remainingAmount > 0) và sắp xếp theo số tháng nợ
        return allStudents.stream()
                .filter(student -> {
                    if (student.getMonthPaymentStatuses() == null || student.getMonthPaymentStatuses().isEmpty()) {
                        return false;
                    }
                    // Kiểm tra xem có tháng nào có remainingAmount > 0 không
                    return student.getMonthPaymentStatuses().stream()
                            .anyMatch(status -> status.getRemainingAmount() != null && status.getRemainingAmount() > 0);
                })
                .sorted(Comparator.comparingInt((StudentResponse student) -> {
                    if (student.getMonthPaymentStatuses() == null) {
                        return 0;
                    }
                    // Đếm số tháng có remainingAmount > 0
                    return (int) student.getMonthPaymentStatuses().stream()
                            .filter(status -> status.getRemainingAmount() != null && status.getRemainingAmount() > 0)
                            .count();
                }).reversed()) // Sắp xếp giảm dần (nhiều tháng nợ nhất trước)
                .collect(Collectors.toList());
    }
}

