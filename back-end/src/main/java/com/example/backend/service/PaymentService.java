package com.example.backend.service;

import com.example.backend.dto.payment.PaymentRequest;
import com.example.backend.dto.payment.PaymentResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.Payment;
import com.example.backend.entity.Student;
import com.example.backend.entity.StudentClass;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.StudentClassStatus;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.StudentClassRepository;
import com.example.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final StudentClassRepository studentClassRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public PaymentResponse createPayment(PaymentRequest paymentRequest) {
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
        // Lấy tất cả payments đã có trong tháng này
        Long remainingAmount = paymentRequest.getFeeSnapshot(); // Mặc định = feeSnapshot nếu chưa có payment nào
        if (paymentRequest.getStudentId() != null && paymentRequest.getBillingMonth() != null) {
            List<Payment> existingPayments = paymentRepository.findAllByStudentIdAndBillingMonth(
                    paymentRequest.getStudentId(),
                    paymentRequest.getBillingMonth()
            );
            
            if (!existingPayments.isEmpty()) {
                // Tính tổng số tiền đã đóng từ các payments trước đó
                Long totalPaidAmount = 0L;
                for (Payment existingPayment : existingPayments) {
                    totalPaidAmount += existingPayment.getPaid() != null ? existingPayment.getPaid() : 0L;
                }
                // Số tiền còn lại = feeSnapshot - tổng đã đóng
                remainingAmount = paymentRequest.getFeeSnapshot() - totalPaidAmount;
                // Đảm bảo không âm
                if (remainingAmount < 0) {
                    remainingAmount = 0L;
                }
            }
        }

        // Luôn tạo payment mới để lưu lịch sử đóng tiền
        // Mỗi lần đóng tiền sẽ tạo một record mới, không cập nhật record cũ
        Payment payment = Payment.builder()
                .paymentId("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .amount(remainingAmount) // Amount = số tiền còn lại cần đóng
                .feeSnapshot(paymentRequest.getFeeSnapshot())
                .paid(paymentRequest.getPaid()) // Số tiền đóng trong lần này
                .billingMonth(paymentRequest.getBillingMonth())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .paymentType(paymentRequest.getPaymentType())
                .direction(paymentRequest.getDirection())
                .student(student)
                .clazz(clazz)
                .note(paymentRequest.getNote())
                .build();

        // Set payment status cho lần đóng này
        // Khi paid >= amount (số tiền đóng >= số tiền còn lại) thì hoàn thành
        if (payment.getPaid() >= payment.getAmount()) {
            payment.setPaymentStatus(PaymentStatus.COMPLETED);
        } else {
            payment.setPaymentStatus(PaymentStatus.INCOMPLETE);
        }

        Payment savedPayment = paymentRepository.save(payment);
        
        // Map to response
        PaymentResponse response = modelMapper.map(savedPayment, PaymentResponse.class);
        
        // Set IDs from relationships
        if (savedPayment.getStudent() != null) {
            response.setStudentId(savedPayment.getStudent().getId());
        }
        if (savedPayment.getTeacher() != null) {
            response.setTeacherId(savedPayment.getTeacher().getId());
        }
        if (savedPayment.getClazz() != null) {
            response.setClassId(savedPayment.getClazz().getId());
        }
        
        return response;
    }

    public List<PaymentResponse> getPaymentsByStudentId(String studentId) {
        List<Payment> payments = paymentRepository.findByStudentId(studentId);
        
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> getAllPayments() {
        List<Payment> payments = paymentRepository.findAllByOrderByCreatedAtDesc();
        return payments.stream()
                .map(this::mapToPaymentResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToPaymentResponse(Payment payment) {
        PaymentResponse response = modelMapper.map(payment, PaymentResponse.class);

        // Set IDs from relationships
        if (payment.getStudent() != null) {
            response.setStudentId(payment.getStudent().getId());
        }
        if (payment.getTeacher() != null) {
            response.setTeacherId(payment.getTeacher().getId());
        }
        if (payment.getClazz() != null) {
            response.setClassId(payment.getClazz().getId());
        }

        return response;
    }
}

