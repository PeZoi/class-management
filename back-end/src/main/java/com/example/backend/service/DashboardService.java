package com.example.backend.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.dashboard.DashboardRevenueDataResponse;
import com.example.backend.dto.dashboard.DashboardStatsResponse;
import com.example.backend.dto.dashboard.RevenueByClassResponse;
import com.example.backend.dto.dashboard.RevenueByPaymentMethodResponse;
import com.example.backend.dto.dashboard.RevenueByStatusResponse;
import com.example.backend.dto.student.SessionPaymentStatusDTO;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.entity.Payment;
import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.PaymentType;
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

        // Calculate total salary expense for current month
        // Tổng lương giáo viên cần trả = tổng totalAmount (feeSnapshot + bonus - deduction) cho tất cả giáo viên
        // Nhóm payments theo teacherId và billingMonth
        Map<String, Long> teacherTotalAmountMap = new HashMap<>();
        Map<String, Long> teacherPaidAmountMap = new HashMap<>();
        
        paymentRepository.findAll().stream()
                .filter(payment -> payment.getPaymentType() == PaymentType.TEACHER_SALARY)
                .filter(payment -> payment.getBillingMonth() != null && 
                        payment.getBillingMonth().equals(currentMonthStart))
                .filter(payment -> payment.getTeacher() != null)
                .forEach(payment -> {
                    String teacherId = payment.getTeacher().getId();
                    
                    // Tính totalAmount từ payment (feeSnapshot + bonus - deduction)
                    Long feeSnapshot = payment.getFeeSnapshot() != null ? payment.getFeeSnapshot() : 0L;
                    Long bonus = payment.getBonus() != null ? payment.getBonus() : 0L;
                    Long deduction = payment.getDeduction() != null ? payment.getDeduction() : 0L;
                    Long totalAmount = feeSnapshot + bonus - deduction;
                    
                    // Lưu totalAmount lớn nhất cho mỗi giáo viên (nếu có nhiều payments với totalAmount khác nhau)
                    teacherTotalAmountMap.put(teacherId, 
                            Math.max(teacherTotalAmountMap.getOrDefault(teacherId, 0L), totalAmount));
                    
                    // Tổng hợp paidAmount cho mỗi giáo viên
                    Long paidAmount = payment.getPaid() != null ? payment.getPaid() : 0L;
                    teacherPaidAmountMap.put(teacherId, 
                            teacherPaidAmountMap.getOrDefault(teacherId, 0L) + paidAmount);
                });
        
        // Tính tổng lương cần trả = tổng totalAmount của tất cả giáo viên
        Long totalSalaryExpense = teacherTotalAmountMap.values().stream()
                .mapToLong(Long::longValue)
                .sum();
        
        // Calculate total salary expense for previous month (for growth calculation)
        Map<String, Long> prevTeacherTotalAmountMap = new HashMap<>();
        
        paymentRepository.findAll().stream()
                .filter(payment -> payment.getPaymentType() == PaymentType.TEACHER_SALARY)
                .filter(payment -> payment.getBillingMonth() != null && 
                        payment.getBillingMonth().equals(previousMonthStart))
                .filter(payment -> payment.getTeacher() != null)
                .forEach(payment -> {
                    String teacherId = payment.getTeacher().getId();
                    
                    Long feeSnapshot = payment.getFeeSnapshot() != null ? payment.getFeeSnapshot() : 0L;
                    Long bonus = payment.getBonus() != null ? payment.getBonus() : 0L;
                    Long deduction = payment.getDeduction() != null ? payment.getDeduction() : 0L;
                    Long totalAmount = feeSnapshot + bonus - deduction;
                    
                    prevTeacherTotalAmountMap.put(teacherId, 
                            Math.max(prevTeacherTotalAmountMap.getOrDefault(teacherId, 0L), totalAmount));
                });
        
        Long previousMonthSalaryExpense = prevTeacherTotalAmountMap.values().stream()
                .mapToLong(Long::longValue)
                .sum();
        
        // Calculate salary expense growth
        Double salaryExpenseGrowth = calculateGrowth(totalSalaryExpense, previousMonthSalaryExpense);

        DashboardStatsResponse response = new DashboardStatsResponse();
        response.setTotalRevenue(currentMonthRevenue); // Doanh thu tháng hiện tại
        response.setTotalClasses(totalClasses);
        response.setTotalStudents(totalStudents);
        response.setTotalTeachers(totalTeachers);
        response.setTotalSalaryExpense(totalSalaryExpense > 0 ? totalSalaryExpense : 0L);
        response.setRevenueGrowth(revenueGrowth);
        response.setStudentGrowth(studentGrowth);
        response.setSalaryExpenseGrowth(salaryExpenseGrowth);

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

            // Tính tổng expense (lương giáo viên) cho tháng này
            Map<String, Long> teacherTotalAmountMap = new HashMap<>();
            
            paymentRepository.findAll().stream()
                    .filter(payment -> payment.getPaymentType() == PaymentType.TEACHER_SALARY)
                    .filter(payment -> payment.getBillingMonth() != null && 
                            payment.getBillingMonth().equals(billingMonth))
                    .filter(payment -> payment.getTeacher() != null)
                    .forEach(payment -> {
                        String teacherId = payment.getTeacher().getId();
                        
                        Long feeSnapshot = payment.getFeeSnapshot() != null ? payment.getFeeSnapshot() : 0L;
                        Long bonus = payment.getBonus() != null ? payment.getBonus() : 0L;
                        Long deduction = payment.getDeduction() != null ? payment.getDeduction() : 0L;
                        Long totalAmount = feeSnapshot + bonus - deduction;
                        
                        teacherTotalAmountMap.put(teacherId, 
                                Math.max(teacherTotalAmountMap.getOrDefault(teacherId, 0L), totalAmount));
                    });
            
            Long expense = teacherTotalAmountMap.values().stream()
                    .mapToLong(Long::longValue)
                    .sum();

            // Tạo label cho tháng
            String monthShort = "T" + targetDate.getMonthValue();
            String monthLabel = "Tháng " + targetDate.getMonthValue();

            DashboardRevenueDataResponse revenueData = DashboardRevenueDataResponse.builder()
                    .month(monthShort)
                    .label(monthLabel)
                    .revenue(revenue)
                    .expense(expense)
                    .build();

            revenueDataList.add(revenueData);
        }

        return revenueDataList;
    }

    /**
     * Lấy danh sách học sinh chưa đóng tiền.
     * Ưu tiên dùng sessionPaymentStatuses (theo gói buổi học) để tính tổng nợ từ quá khứ tới hiện tại.
     * Nếu học viên chưa có sessionPaymentStatuses thì fallback về monthPaymentStatuses như cũ.
     *
     * @return Danh sách học sinh có nợ
     */
    public List<StudentResponse> getStudentsWithUnpaidFees() {
        // Lấy tất cả học sinh với đầy đủ thông tin payment (monthPaymentStatuses & sessionPaymentStatuses)
        List<StudentResponse> allStudents = studentService.getAll();

        // Filter những học sinh có nợ (remainingAmount > 0)
        return allStudents.stream()
                .map(student -> {
                    long totalDebtBySession = 0L;

                    List<SessionPaymentStatusDTO> sessionStatuses = student.getSessionPaymentStatuses();

                    if (sessionStatuses != null && !sessionStatuses.isEmpty()) {
                        // Tìm package hiện tại (isCurrent = true)
                        Optional<Integer> currentPackageNumberOpt = sessionStatuses.stream()
                                .filter(s -> Boolean.TRUE.equals(s.getIsCurrent()))
                                .map(SessionPaymentStatusDTO::getPackageNumber)
                                .findFirst();

                        int maxPackageNumber = sessionStatuses.stream()
                                .map(SessionPaymentStatusDTO::getPackageNumber)
                                .filter(Objects::nonNull)
                                .mapToInt(Integer::intValue)
                                .max()
                                .orElse(0);

                        int currentPackageNumber = currentPackageNumberOpt.orElse(maxPackageNumber);

                        if (currentPackageNumber > 0) {
                            // Tổng nợ = tổng remainingAmount của tất cả package từ trước đến gói hiện tại
                            totalDebtBySession = sessionStatuses.stream()
                                    .filter(s -> s.getPackageNumber() != null && s.getPackageNumber() <= currentPackageNumber)
                                    .map(SessionPaymentStatusDTO::getRemainingAmount)
                                    .filter(Objects::nonNull)
                                    .mapToLong(Long::longValue)
                                    .sum();
                        }
                    }

                    // Fallback: nếu chưa có sessionPaymentStatuses, dùng monthPaymentStatuses như logic cũ
                    long totalDebtByMonth = 0L;
                    if ((sessionStatuses == null || sessionStatuses.isEmpty())
                            && student.getMonthPaymentStatuses() != null) {
                        totalDebtByMonth = student.getMonthPaymentStatuses().stream()
                                .filter(status -> status.getRemainingAmount() != null && status.getRemainingAmount() > 0)
                                .mapToLong(status -> status.getRemainingAmount() != null ? status.getRemainingAmount() : 0L)
                                .sum();
                    }

                    long finalDebt = totalDebtBySession > 0 ? totalDebtBySession : totalDebtByMonth;

                    return new AbstractMap.SimpleEntry<>(student, finalDebt);
                })
                // Chỉ giữ những học viên có nợ > 0
                .filter(entry -> entry.getValue() > 0)
                // Sắp xếp giảm dần theo tổng nợ
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                // Trả về danh sách StudentResponse
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    /**
     * Lấy doanh thu theo lớp học (theo ngày thanh toán - createdDate)
     * Vì hệ thống đóng tiền theo package, nên tính theo ngày thanh toán là hợp lý nhất
     */
    public List<RevenueByClassResponse> getRevenueByClass(String period) {
        LocalDate now = LocalDate.now();
        int monthsToInclude;
        
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
        
        // Tính thời gian bắt đầu (từ tháng hiện tại ngược lại)
        LocalDate startDate = now.minusMonths(monthsToInclude - 1).withDayOfMonth(1);
        Instant startInstant = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = now.plusMonths(1).withDayOfMonth(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        
        // Sử dụng custom query với JOIN FETCH để load Class entity cùng lúc
        List<Payment> payments = paymentRepository.findAllByDirectionAndCreatedAtBetweenWithClass(
                PaymentDirection.INCOME, startInstant, endInstant);
        
        // Nhóm payments theo classId và tính tổng revenue
        Map<String, RevenueByClassResponse> revenueMap = new HashMap<>();
        
        payments.stream()
                .filter(payment -> payment.getClazz() != null)
                .forEach(payment -> {
                    String classId = payment.getClazz().getId();
                    String className = payment.getClazz().getName();
                    Long paid = payment.getPaid() != null ? payment.getPaid() : 0L;
                    
                    RevenueByClassResponse existing = revenueMap.get(classId);
                    if (existing == null) {
                        revenueMap.put(classId, RevenueByClassResponse.builder()
                                .classId(classId)
                                .className(className)
                                .revenue(paid)
                                .build());
                    } else {
                        existing.setRevenue(existing.getRevenue() + paid);
                    }
                });
        
        // Sắp xếp giảm dần theo revenue và trả về
        return revenueMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getRevenue(), a.getRevenue()))
                .collect(Collectors.toList());
    }

    /**
     * Lấy doanh thu theo phương thức thanh toán (theo ngày thanh toán)
     */
    public List<RevenueByPaymentMethodResponse> getRevenueByPaymentMethod(String period) {
        LocalDate now = LocalDate.now();
        int monthsToInclude;
        
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
        
        LocalDate startDate = now.minusMonths(monthsToInclude - 1).withDayOfMonth(1);
        Instant startInstant = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = now.plusMonths(1).withDayOfMonth(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        
        Map<PaymentMethod, RevenueByPaymentMethodResponse> revenueMap = new HashMap<>();
        
        paymentRepository.findAll().stream()
                .filter(payment -> payment.getDirection() == PaymentDirection.INCOME)
                .filter(payment -> payment.getCreatedAt() != null)
                .filter(payment -> payment.getCreatedAt().isAfter(startInstant) && payment.getCreatedAt().isBefore(endInstant))
                .forEach(payment -> {
                    PaymentMethod method = payment.getPaymentMethod();
                    Long paid = payment.getPaid() != null ? payment.getPaid() : 0L;
                    
                    RevenueByPaymentMethodResponse existing = revenueMap.get(method);
                    if (existing == null) {
                        String methodLabel = getPaymentMethodLabel(method);
                        revenueMap.put(method, RevenueByPaymentMethodResponse.builder()
                                .paymentMethod(method.name())
                                .paymentMethodLabel(methodLabel)
                                .revenue(paid)
                                .count(1L)
                                .build());
                    } else {
                        existing.setRevenue(existing.getRevenue() + paid);
                        existing.setCount(existing.getCount() + 1);
                    }
                });
        
        return revenueMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getRevenue(), a.getRevenue()))
                .collect(Collectors.toList());
    }

    /**
     * Lấy doanh thu theo trạng thái thanh toán (theo ngày thanh toán)
     */
    public List<RevenueByStatusResponse> getRevenueByStatus(String period) {
        LocalDate now = LocalDate.now();
        int monthsToInclude;
        
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
        
        LocalDate startDate = now.minusMonths(monthsToInclude - 1).withDayOfMonth(1);
        Instant startInstant = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = now.plusMonths(1).withDayOfMonth(1).atStartOfDay(ZoneOffset.UTC).toInstant();
        
        Map<PaymentStatus, RevenueByStatusResponse> revenueMap = new HashMap<>();
        
        paymentRepository.findAll().stream()
                .filter(payment -> payment.getDirection() == PaymentDirection.INCOME)
                .filter(payment -> payment.getCreatedAt() != null)
                .filter(payment -> payment.getCreatedAt().isAfter(startInstant) && payment.getCreatedAt().isBefore(endInstant))
                .forEach(payment -> {
                    PaymentStatus status = payment.getPaymentStatus();
                    Long paid = payment.getPaid() != null ? payment.getPaid() : 0L;
                    
                    RevenueByStatusResponse existing = revenueMap.get(status);
                    if (existing == null) {
                        String statusLabel = getPaymentStatusLabel(status);
                        revenueMap.put(status, RevenueByStatusResponse.builder()
                                .status(status.name())
                                .statusLabel(statusLabel)
                                .revenue(paid)
                                .count(1L)
                                .build());
                    } else {
                        existing.setRevenue(existing.getRevenue() + paid);
                        existing.setCount(existing.getCount() + 1);
                    }
                });
        
        return revenueMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getRevenue(), a.getRevenue()))
                .collect(Collectors.toList());
    }

    private String getPaymentMethodLabel(PaymentMethod method) {
        switch (method) {
            case CASH:
                return "Tiền mặt";
            case BANK_TRANSFER:
                return "Chuyển khoản";
            default:
                return method.name();
        }
    }

    private String getPaymentStatusLabel(PaymentStatus status) {
        switch (status) {
            case COMPLETED:
                return "Đã thanh toán đủ";
            case INCOMPLETE:
                return "Chưa thanh toán đủ";
            default:
                return status.name();
        }
    }
}

