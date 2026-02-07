package com.example.backend.service;

import com.example.backend.dto.student.SessionPaymentStatusDTO;
import com.example.backend.entity.Class;
import com.example.backend.entity.SessionPaymentPackage;
import com.example.backend.entity.Student;
import com.example.backend.enums.SessionPaymentStatus;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.AttendanceRepository;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.SessionPaymentPackageRepository;
import com.example.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionPaymentService {
    private final SessionPaymentPackageRepository packageRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;

    private static final int SESSIONS_PER_PACKAGE = 8;

    /**
     * Tự động tạo gói thanh toán mới khi học viên học đủ 8 buổi
     */
    @Transactional
    public SessionPaymentPackage createNewPackage(String studentId, String classId, Integer startSessionNumber) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

        Class clazz = classRepository.findById(classId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        // Tính package number
        Integer packageNumber = getNextPackageNumber(studentId, classId);
        Integer endSessionNumber = startSessionNumber + SESSIONS_PER_PACKAGE - 1;

        // Lấy monthlyFee từ class
        Long expectedAmount = Long.valueOf(clazz.getMonthlyFee());

        // Tạo package mới
        SessionPaymentPackage paymentPackage = SessionPaymentPackage.builder()
                .student(student)
                .clazz(clazz)
                .packageNumber(packageNumber)
                .startSessionNumber(startSessionNumber)
                .endSessionNumber(endSessionNumber)
                .expectedAmount(expectedAmount)
                .paidAmount(0L)
                .status(SessionPaymentStatus.UNPAID)
                .createdAtPackage(Instant.now())
                .build();

        return packageRepository.save(paymentPackage);
    }

    /**
     * Tính toán trạng thái thanh toán theo gói
     */
    @Transactional(readOnly = true)
    public List<SessionPaymentStatusDTO> calculateSessionPaymentStatuses(
            String studentId, String classId, Instant joinAt, int monthlyFee) {
        List<SessionPaymentStatusDTO> statuses = new ArrayList<>();

        if (joinAt == null) {
            return statuses;
        }

        // Đếm số buổi đã học
        Long totalAttendedSessions = attendanceRepository.countAttendedSessions(studentId, classId);
        if (totalAttendedSessions == null || totalAttendedSessions == 0) {
            return statuses;
        }

        // Tính số gói cần hiển thị (dựa trên số buổi đã học)
        int totalPackages = (int) Math.ceil((double) totalAttendedSessions / SESSIONS_PER_PACKAGE);

        // Lấy tất cả packages từ database
        List<SessionPaymentPackage> packages = packageRepository.findByStudentIdAndClazzIdOrderByPackageNumberAsc(studentId, classId);

        // Tạo map để dễ tìm package theo packageNumber
        java.util.Map<Integer, SessionPaymentPackage> packageMap = packages.stream()
                .collect(Collectors.toMap(SessionPaymentPackage::getPackageNumber, p -> p));

        // Tạo status cho từng gói
        for (int i = 1; i <= totalPackages; i++) {
            Integer startSession = (i - 1) * SESSIONS_PER_PACKAGE + 1;
            Integer endSession = i * SESSIONS_PER_PACKAGE;

            SessionPaymentPackage paymentPackage = packageMap.get(i);

            if (paymentPackage != null) {
                // Package đã tồn tại trong database
                Long paidAmount = calculatePaidAmountForPackage(studentId, classId, i);
                Long remainingAmount = paymentPackage.getExpectedAmount() - paidAmount;

                SessionPaymentStatus status;
                if (paidAmount >= paymentPackage.getExpectedAmount()) {
                    status = SessionPaymentStatus.PAID;
                    remainingAmount = 0L;
                } else if (paidAmount > 0) {
                    status = SessionPaymentStatus.PARTIAL;
                } else {
                    status = SessionPaymentStatus.UNPAID;
                }

                SessionPaymentStatusDTO statusDTO = SessionPaymentStatusDTO.builder()
                        .packageNumber(i)
                        .startSessionNumber(startSession)
                        .endSessionNumber(endSession)
                        .expectedAmount(paymentPackage.getExpectedAmount())
                        .paidAmount(paidAmount)
                        .remainingAmount(remainingAmount)
                        .status(status)
                        .createdAtPackage(paymentPackage.getCreatedAtPackage())
                        .completedAt(paymentPackage.getCompletedAt())
                        .build();

                statuses.add(statusDTO);
            } else {
                // Package chưa tồn tại, tạo mới với thông tin mặc định
                SessionPaymentStatusDTO statusDTO = SessionPaymentStatusDTO.builder()
                        .packageNumber(i)
                        .startSessionNumber(startSession)
                        .endSessionNumber(endSession)
                        .expectedAmount(Long.valueOf(monthlyFee))
                        .paidAmount(0L)
                        .remainingAmount(Long.valueOf(monthlyFee))
                        .status(SessionPaymentStatus.UNPAID)
                        .build();

                statuses.add(statusDTO);
            }
        }

        return statuses;
    }

    /**
     * Lấy gói thanh toán hiện tại chưa thanh toán đủ
     */
    @Transactional(readOnly = true)
    public Optional<SessionPaymentPackage> getCurrentUnpaidPackage(String studentId, String classId) {
        return packageRepository.findCurrentUnpaidPackage(studentId, classId);
    }

    /**
     * Cập nhật trạng thái gói sau khi thanh toán
     */
    @Transactional
    public void updatePackageAfterPayment(String packageId, Long paidAmount) {
        SessionPaymentPackage paymentPackage = packageRepository.findById(packageId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy gói thanh toán"));

        Long totalPaid = calculatePaidAmountForPackage(
                paymentPackage.getStudent().getId(),
                paymentPackage.getClazz().getId(),
                paymentPackage.getPackageNumber());

        paymentPackage.setPaidAmount(totalPaid);

        // Cập nhật status
        if (totalPaid >= paymentPackage.getExpectedAmount()) {
            paymentPackage.setStatus(SessionPaymentStatus.PAID);
            paymentPackage.setCompletedAt(Instant.now());
        } else if (totalPaid > 0) {
            paymentPackage.setStatus(SessionPaymentStatus.PARTIAL);
        } else {
            paymentPackage.setStatus(SessionPaymentStatus.UNPAID);
        }

        packageRepository.save(paymentPackage);
    }

    /**
     * Tính số tiền đã đóng cho một package
     */
    @Transactional(readOnly = true)
    public Long calculatePaidAmountForPackage(String studentId, String classId, Integer packageNumber) {
        List<com.example.backend.entity.Payment> payments = paymentRepository
                .findAllByStudentIdAndClassIdAndPackageNumber(studentId, classId, packageNumber);

        return payments.stream()
                .mapToLong(p -> p.getPaid() != null ? p.getPaid() : 0L)
                .sum();
    }

    /**
     * Lấy package number tiếp theo
     */
    @Transactional(readOnly = true)
    public Integer getNextPackageNumber(String studentId, String classId) {
        Optional<Integer> maxPackage = packageRepository.findMaxPackageNumber(studentId, classId);
        return maxPackage.map(p -> p + 1).orElse(1);
    }

    /**
     * Kiểm tra package đã tồn tại chưa
     */
    @Transactional(readOnly = true)
    public Boolean packageExists(String studentId, String classId, Integer packageNumber) {
        return packageRepository.findByStudentIdAndClazzIdAndPackageNumber(studentId, classId, packageNumber)
                .isPresent();
    }

    /**
     * Lấy package theo package number
     */
    @Transactional(readOnly = true)
    public Optional<SessionPaymentPackage> getPackageByNumber(String studentId, String classId, Integer packageNumber) {
        return packageRepository.findByStudentIdAndClazzIdAndPackageNumber(studentId, classId, packageNumber);
    }

    /**
     * Tạo package với package number và session numbers cụ thể
     * Dùng khi tạo payment cho một package cụ thể mà package chưa tồn tại
     */
    @Transactional
    public SessionPaymentPackage createPackageWithNumber(
            String studentId, String classId, Integer packageNumber, 
            Integer startSessionNumber, Integer endSessionNumber) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

        Class clazz = classRepository.findById(classId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        // Lấy monthlyFee từ class
        Long expectedAmount = Long.valueOf(clazz.getMonthlyFee());

        // Tạo package mới với package number cụ thể
        SessionPaymentPackage paymentPackage = SessionPaymentPackage.builder()
                .student(student)
                .clazz(clazz)
                .packageNumber(packageNumber)
                .startSessionNumber(startSessionNumber)
                .endSessionNumber(endSessionNumber)
                .expectedAmount(expectedAmount)
                .paidAmount(0L)
                .status(SessionPaymentStatus.UNPAID)
                .createdAtPackage(Instant.now())
                .build();

        return packageRepository.save(paymentPackage);
    }
}

