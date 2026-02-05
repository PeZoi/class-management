package com.example.backend.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import com.example.backend.entity.SessionPaymentPackage;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.payment.PaymentRequest;
import com.example.backend.dto.payment.PaymentResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.Payment;
import com.example.backend.entity.Student;
import com.example.backend.entity.StudentClass;
import com.example.backend.entity.User;
import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.PaymentType;
import com.example.backend.enums.StudentClassStatus;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.StudentClassRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final StudentClassRepository studentClassRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final SessionPaymentService sessionPaymentService;

    @Transactional
    public PaymentResponse createPayment(PaymentRequest paymentRequest) {
        // Xử lý teacher payment
        if (paymentRequest.getTeacherId() != null) {
            return createTeacherPayment(paymentRequest);
        }

        // Xử lý student payment (logic cũ)
        // Validate student exists
        Student student = null;
        if (paymentRequest.getStudentId() != null) {
            student = studentRepository.findById(paymentRequest.getStudentId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));
        }

        // Validate class exists and get class info
        Class clazz = null;
        if (paymentRequest.getClassId() != null) {
            clazz = classRepository.findById(paymentRequest.getClassId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
        } else if (student != null) {
            // If no classId provided, get current class from student
            StudentClass studentClass = studentClassRepository.findCurrentClassByStudent(student.getId(), StudentClassStatus.STUDYING);
            if (studentClass != null) {
                clazz = studentClass.getClazz();
            }
        }

        // Tính số tiền còn lại cần đóng (remaining amount)
        Long remainingAmount = paymentRequest.getFeeSnapshot(); // Mặc định = feeSnapshot nếu chưa có payment nào
        
        // Kiểm tra xem đây là session-based payment hay month-based payment
        boolean isSessionBased = paymentRequest.getPackageNumber() != null 
                && paymentRequest.getSessionStartNumber() != null 
                && paymentRequest.getSessionEndNumber() != null;
        
        if (isSessionBased) {
            // Session-based payment: tính theo package
            if (paymentRequest.getStudentId() != null && paymentRequest.getClassId() != null) {
                List<Payment> existingPayments = paymentRepository.findAllByStudentIdAndClassIdAndPackageNumber(
                        paymentRequest.getStudentId(),
                        paymentRequest.getClassId(),
                        paymentRequest.getPackageNumber()
                );
                
                if (!existingPayments.isEmpty()) {
                    Long totalPaidAmount = existingPayments.stream()
                            .mapToLong(p -> p.getPaid() != null ? p.getPaid() : 0L)
                            .sum();
                    remainingAmount = paymentRequest.getFeeSnapshot() - totalPaidAmount;
                    if (remainingAmount < 0) {
                        remainingAmount = 0L;
                    }
                }
            }
        } else {
            // Month-based payment (backward compatibility)
            if (paymentRequest.getStudentId() != null && paymentRequest.getBillingMonth() != null) {
                List<Payment> existingPayments = paymentRepository.findAllByStudentIdAndBillingMonth(
                        paymentRequest.getStudentId(),
                        paymentRequest.getBillingMonth()
                );
                
                if (!existingPayments.isEmpty()) {
                    Long totalPaidAmount = 0L;
                    for (Payment existingPayment : existingPayments) {
                        totalPaidAmount += existingPayment.getPaid() != null ? existingPayment.getPaid() : 0L;
                    }
                    remainingAmount = paymentRequest.getFeeSnapshot() - totalPaidAmount;
                    if (remainingAmount < 0) {
                        remainingAmount = 0L;
                    }
                }
            }
        }

        // Luôn tạo payment mới để lưu lịch sử đóng tiền
        // Mỗi lần đóng tiền sẽ tạo một record mới, không cập nhật record cũ
        Payment.PaymentBuilder paymentBuilder = Payment.builder()
                .paymentId(generatePaymentId(paymentRequest.getDirection()))
                .amount(remainingAmount) // Amount = số tiền còn lại cần đóng
                .feeSnapshot(paymentRequest.getFeeSnapshot())
                .paid(paymentRequest.getPaid()) // Số tiền đóng trong lần này
                .paymentMethod(paymentRequest.getPaymentMethod())
                .paymentType(paymentRequest.getPaymentType())
                .direction(paymentRequest.getDirection())
                .student(student)
                .clazz(clazz)
                .note(paymentRequest.getNote());
        
        // Set session-based fields nếu có
        if (isSessionBased) {
            paymentBuilder.packageNumber(paymentRequest.getPackageNumber())
                         .sessionStartNumber(paymentRequest.getSessionStartNumber())
                         .sessionEndNumber(paymentRequest.getSessionEndNumber());
        }
        
        // Set billingMonth (có thể null nếu là session-based)
        paymentBuilder.billingMonth(paymentRequest.getBillingMonth());
        
        Payment payment = paymentBuilder.build();

        // Set payment status cho lần đóng này
        // Khi paid >= amount (số tiền đóng >= số tiền còn lại) thì hoàn thành
        if (payment.getPaid() >= payment.getAmount()) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
        } else {
            payment.setPaymentStatus(PaymentStatus.INCOMPLETE);
        }

        Payment savedPayment = paymentRepository.save(payment);
        
        // Cập nhật package status nếu là session-based payment
        if (isSessionBased && paymentRequest.getPackageNumber() != null && clazz != null && student != null) {
            Optional<SessionPaymentPackage> packageOpt = sessionPaymentService.getPackageByNumber(
                    student.getId(), 
                    clazz.getId(), 
                    paymentRequest.getPackageNumber()
            );
            if (packageOpt.isPresent()) {
                // Tính lại tổng paid amount từ tất cả payments
                Long totalPaid = calculatePaidAmountForPackage(student.getId(), clazz.getId(), paymentRequest.getPackageNumber());
                sessionPaymentService.updatePackageAfterPayment(packageOpt.get().getId(), totalPaid);
            }
        }
        
        // Map to response using helper method
        PaymentResponse paymentResponse = mapToPaymentResponse(savedPayment);
        
        // Gửi email thông báo cho học viên với PDF đính kèm (chạy bất đồng bộ)
        if (student != null && student.getEmail() != null) {
            String className = clazz != null ? clazz.getName() : null;
            emailService.sendStudentPaymentNotification(
                student.getEmail(),
                student.getFullName(),
                savedPayment.getPaid(),
                savedPayment.getPaymentMethod(),
                className,
                savedPayment.getBillingMonth(),
                savedPayment.getNote(),
                savedPayment.getPaymentId(),
                paymentResponse  // Truyền PaymentResponse để tạo PDF
            );
        }
        
        return paymentResponse;
    }

    private PaymentResponse createTeacherPayment(PaymentRequest paymentRequest) {
        // Validate teacher exists
        User teacher = userRepository.findById(paymentRequest.getTeacherId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));

        // Tính total amount = baseSalary (feeSnapshot) + bonus - deduction
        Long bonus = paymentRequest.getBonus() != null ? paymentRequest.getBonus() : 0L;
        Long deduction = paymentRequest.getDeduction() != null ? paymentRequest.getDeduction() : 0L;
        Long totalAmount = paymentRequest.getFeeSnapshot() + bonus - deduction;

        // Tính remaining amount (nếu đã trả một phần trong tháng này)
        Long remainingAmount = totalAmount;
        if (paymentRequest.getBillingMonth() != null) {
            List<Payment> existingPayments = paymentRepository.findAllByTeacherIdAndBillingMonth(
                    paymentRequest.getTeacherId(),
                    paymentRequest.getBillingMonth()
            );

            if (!existingPayments.isEmpty()) {
                Long totalPaid = existingPayments.stream()
                        .mapToLong(p -> p.getPaid() != null ? p.getPaid() : 0L)
                        .sum();
                remainingAmount = totalAmount - totalPaid;
                if (remainingAmount < 0) {
                    remainingAmount = 0L;
                }
            }
        }

        // Tạo payment cho teacher
        Payment payment = Payment.builder()
                .paymentId(generatePaymentId(PaymentDirection.EXPENSE))
                .amount(remainingAmount)
                .feeSnapshot(paymentRequest.getFeeSnapshot()) // baseSalary
                .paid(paymentRequest.getPaid())
                .bonus(bonus)
                .deduction(deduction)
                .billingMonth(paymentRequest.getBillingMonth())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .paymentType(PaymentType.TEACHER_SALARY)
                .direction(PaymentDirection.EXPENSE)
                .teacher(teacher)
                .note(paymentRequest.getNote())
                .build();

        // Set payment status
        if (payment.getPaid() >= payment.getAmount()) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
        } else {
            payment.setPaymentStatus(PaymentStatus.INCOMPLETE);
        }

        Payment savedPayment = paymentRepository.save(payment);
        
        // Map to response using helper method
        PaymentResponse paymentResponse = mapToPaymentResponse(savedPayment);
        
        // Gửi email thông báo cho giáo viên với PDF đính kèm (chạy bất đồng bộ)
        if (teacher.getEmail() != null) {
            emailService.sendTeacherPaymentNotification(
                teacher.getEmail(),
                teacher.getFullName(),
                savedPayment.getPaid(),
                savedPayment.getFeeSnapshot(),
                savedPayment.getBonus(),
                savedPayment.getDeduction(),
                savedPayment.getPaymentMethod(),
                savedPayment.getBillingMonth(),
                savedPayment.getNote(),
                savedPayment.getPaymentId(),
                paymentResponse  // Truyền PaymentResponse để tạo PDF
            );
        }
        
        return paymentResponse;
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByStudentId(String studentId) {
        List<Payment> payments = paymentRepository.findByStudentId(studentId);
        
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByTeacherId(String teacherId) {
        List<Payment> payments = paymentRepository.findByTeacherId(teacherId);
        
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        List<Payment> payments = paymentRepository.findAllByOrderByCreatedAtDesc();
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(String paymentId) {
        // Tìm theo ID trước
        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        
        // Nếu không tìm thấy, thử tìm theo paymentId
        if (paymentOpt.isEmpty()) {
            paymentOpt = paymentRepository.findByPaymentId(paymentId);
        }
        
        if (paymentOpt.isEmpty()) {
            return null;
        }
        
        return mapToPaymentResponse(paymentOpt.get());
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        // Create response manually to avoid ModelMapper issues with nested objects
        PaymentResponse response = new PaymentResponse();
        
        // Map basic fields
        response.setId(payment.getId());
        response.setPaymentId(payment.getPaymentId());
        response.setAmount(payment.getAmount());
        response.setFeeSnapshot(payment.getFeeSnapshot());
        response.setPaid(payment.getPaid());
        response.setBonus(payment.getBonus());
        response.setDeduction(payment.getDeduction());
        response.setBillingMonth(payment.getBillingMonth());
        response.setPaymentStatus(payment.getPaymentStatus());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setPaymentType(payment.getPaymentType());
        response.setDirection(payment.getDirection());
        response.setNote(payment.getNote());
        
        // Map dates from Auditable
        if (payment.getCreatedAt() != null) {
            response.setCreatedAt(payment.getCreatedAt());
        }
        if (payment.getUpdatedAt() != null) {
            response.setUpdatedAt(payment.getUpdatedAt());
        }

        // Map nested objects for student
        if (payment.getStudent() != null) {
            Student student = payment.getStudent();
            PaymentResponse.StudentPayment studentPayment = new PaymentResponse.StudentPayment();
            studentPayment.setId(student.getId());
            studentPayment.setFullName(student.getFullName());
            if (student.getGender() != null) {
                studentPayment.setGender(student.getGender().name());
            }
            response.setStudent(studentPayment);
            response.setStudentId(student.getId());
        }

        // Map nested objects for teacher
        if (payment.getTeacher() != null) {
            com.example.backend.entity.User teacher = payment.getTeacher();
            PaymentResponse.TeacherPayment teacherPayment = new PaymentResponse.TeacherPayment();
            teacherPayment.setId(teacher.getId());
            teacherPayment.setFullName(teacher.getFullName());
            if (teacher.getGender() != null) {
                teacherPayment.setGender(teacher.getGender().name());
            }
            response.setTeacher(teacherPayment);
            response.setTeacherId(teacher.getId());
        }

        // Map nested objects for class
        if (payment.getClazz() != null) {
            Class clazz = payment.getClazz();
            PaymentResponse.ClassPayment classPayment = new PaymentResponse.ClassPayment();
            classPayment.setId(clazz.getId());
            classPayment.setName(clazz.getName());
            response.setClazz(classPayment);
            response.setClassId(clazz.getId());
        }

        return response;
    }

    /**
     * Generate payment ID with format: {INC|EXP}-{yymmdd}{8 random chars}
     * Example: INC-190126ABC12345 or EXP-190126XYZ98765
     * 
     * @param direction PaymentDirection (INCOME -> INC, EXPENSE -> EXP)
     * @return Formatted payment ID
     */
    private String generatePaymentId(PaymentDirection direction) {
        // Determine prefix based on direction
        String prefix = direction == PaymentDirection.INCOME ? "INC" : "EXP";
        
        // Get current date and format as yymmdd (year-month-day without separators)
        LocalDate now = LocalDate.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("ddMMyy");
        String dateStr = now.format(formatter);
        
        // Generate 8 random characters from UUID
        String randomPart = UUID.randomUUID().toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
        
        return String.format("%s-%s%s", prefix, dateStr, randomPart);
    }

    // Helper method để tính tổng paid amount cho một package
    private Long calculatePaidAmountForPackage(String studentId, String classId, Integer packageNumber) {
        List<Payment> payments = paymentRepository.findAllByStudentIdAndClassIdAndPackageNumber(
                studentId, classId, packageNumber);
        return payments.stream()
                .mapToLong(p -> p.getPaid() != null ? p.getPaid() : 0L)
                .sum();
    }
}

