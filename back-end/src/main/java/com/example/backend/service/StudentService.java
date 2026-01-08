package com.example.backend.service;

import com.example.backend.dto.student.MonthPaymentStatus;
import com.example.backend.dto.student.StudentRequest;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.Payment;
import com.example.backend.entity.Student;
import com.example.backend.entity.StudentClass;
import com.example.backend.enums.StudentClassStatus;
import com.example.backend.enums.StudentStatus;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.StudentClassRepository;
import com.example.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentClassRepository studentClassRepository;
    private final ClassRepository classRepository;
    private final PaymentRepository paymentRepository;
    private final ModelMapper modelMapper;

    public StudentClass getClassByStudent(String studentId) {
        return studentClassRepository.findCurrentClassByStudent(studentId, StudentClassStatus.STUDYING);
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getAll() {
        List<StudentResponse> studentResponseList = new ArrayList<>();
        List<Student> studentList = studentRepository.findAll();

        for (Student s : studentList) {
            StudentResponse studentResponse = modelMapper.map(s, StudentResponse.class);
            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();

            StudentClass studentClass = getClassByStudent(studentResponse.getId());
            if (studentClass == null) {
                studentResponseList.add(studentResponse);
                continue;
            }
            Class classDB = studentClass.getClazz();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClass.getJoinedAt());

            studentResponse.setClazz(studentClassResponse);

            studentResponseList.add(studentResponse);
        }
        return studentResponseList;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsByClass(String classId) {
        List<StudentResponse> studentResponseList = new ArrayList<>();
        Class _classDB = classRepository.findById(classId).orElseThrow(() -> new NotFoundException("Không tìm thấy " +
                "lớp" +
                " học"));
        List<Student> studentList = studentClassRepository.findStudentsByClass(classId, StudentClassStatus.STUDYING, StudentStatus.ACTIVE);


        for (Student s : studentList) {
            StudentResponse studentResponse = modelMapper.map(s, StudentResponse.class);
            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();

            StudentClass studentClass = getClassByStudent(studentResponse.getId());
            Class classDB = studentClass.getClazz();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClass.getJoinedAt());

            studentResponse.setClazz(studentClassResponse);

            studentResponseList.add(studentResponse);
        }
        return studentResponseList;
    }

    @Transactional
    public StudentResponse create(StudentRequest studentRequest) {
        Class classDB = classRepository.findById(studentRequest.getClassId()).orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
        Student studentReq = modelMapper.map(studentRequest, Student.class);
        studentReq.setId(null);
        studentReq.setStatus(StudentStatus.ACTIVE);

        Student student = studentRepository.save(studentReq);

        StudentClass studentClass = new StudentClass();
        studentClass.setStudent(student);
        studentClass.setClazz(classDB);
        studentClass.setJoinedAt(Instant.now());
        studentClass.setStatus(StudentClassStatus.STUDYING);
        StudentClass studentClassDB = studentClassRepository.save(studentClass);

        StudentResponse studentResponse = modelMapper.map(student, StudentResponse.class);
        StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
        studentClassResponse.setId(classDB.getId());
        studentClassResponse.setName(classDB.getName());
        studentClassResponse.setJoinAt(studentClassDB.getJoinedAt());
        studentResponse.setClazz(studentClassResponse);
        return studentResponse;
    }

    @Transactional
    public StudentResponse update(StudentRequest studentRequest, String studentId) {
        Student studentDB = studentRepository.findById(studentId).orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));
        studentDB.setFullName(studentRequest.getFullName());
        studentDB.setEmail(studentRequest.getEmail());
        studentDB.setPhoneNumber(studentRequest.getPhoneNumber());
        studentDB.setDob(studentRequest.getDob());
        studentDB.setGender(studentRequest.getGender());
        studentDB.setFullNameParent(studentRequest.getFullNameParent());
        studentDB.setPhoneNumberParent(studentRequest.getPhoneNumberParent());

        Student student = studentRepository.save(studentDB);
        StudentResponse studentResponse = modelMapper.map(student, StudentResponse.class);

        StudentClass studentClassDB = studentClassRepository.findCurrentClassByStudent(studentId, StudentClassStatus.STUDYING);
        if (!studentId.equals(studentClassDB.getClazz().getId())) {
            studentClassDB.setLeftAt(Instant.now());
            studentClassDB.setStatus(StudentClassStatus.CHANGING);
            studentClassRepository.save(studentClassDB);

            StudentClass studentClass = new StudentClass();
            Class classDB = classRepository.findById(studentRequest.getClassId()).orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
            studentClass.setJoinedAt(Instant.now());
            studentClass.setStatus(StudentClassStatus.STUDYING);
            studentClass.setClazz(classDB);
            studentClass.setStudent(studentDB);
            StudentClass studentClassResponseDB = studentClassRepository.save(studentClass);

            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClassDB.getJoinedAt());
            studentResponse.setClazz(studentClassResponse);
        }

        return studentResponse;
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentById(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

        StudentResponse studentResponse = modelMapper.map(student, StudentResponse.class);
        StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();

        StudentClass studentClass = getClassByStudent(studentResponse.getId());
        if (studentClass != null) {
            Class classDB = studentClass.getClazz();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClass.getJoinedAt());
            studentClassResponse.setMonthlyFee(classDB.getMonthlyFee());
            studentResponse.setClazz(studentClassResponse);
            
            // Tính toán trạng thái thanh toán của tất cả các tháng từ joinAt đến hiện tại
            List<MonthPaymentStatus> monthPaymentStatuses = calculateMonthPaymentStatuses(
                    student.getId(),
                    studentClass.getJoinedAt(),
                    classDB.getMonthlyFee()
            );
            studentResponse.setMonthPaymentStatuses(monthPaymentStatuses);
        }

        return studentResponse;
    }

    /**
     * Tính toán trạng thái thanh toán của tất cả các tháng từ joinAt đến tháng hiện tại
     * @param studentId ID của học viên
     * @param joinAt Thời gian tham gia lớp
     * @param monthlyFee Học phí hàng tháng
     * @return Danh sách trạng thái thanh toán của tất cả các tháng
     */
    private List<MonthPaymentStatus> calculateMonthPaymentStatuses(String studentId, Instant joinAt, int monthlyFee) {
        List<MonthPaymentStatus> monthPaymentStatuses = new ArrayList<>();
        
        if (joinAt == null) {
            return monthPaymentStatuses;
        }
        
        // Chuyển joinAt sang LocalDate để tính tháng
        LocalDate joinDate = joinAt.atZone(ZoneId.systemDefault()).toLocalDate();
        YearMonth joinMonth = YearMonth.from(joinDate);
        
        // Tháng hiện tại
        YearMonth currentMonth = YearMonth.now();
        
        // Tạo danh sách các tháng từ joinMonth đến currentMonth (bao gồm cả hai)
        YearMonth month = joinMonth;
        while (!month.isAfter(currentMonth)) {
            // Tạo Instant cho ngày đầu tháng (ví dụ: 2025-09-01 00:00:00)
            LocalDate firstDayOfMonth = month.atDay(1);
            Instant billingMonthInstant = firstDayOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
            
            // Lấy tất cả payments của tháng này để tổng hợp
            List<Payment> paymentsForMonth = paymentRepository.findAllByStudentIdAndBillingMonth(studentId, billingMonthInstant);
            
            MonthPaymentStatus monthPaymentStatus;
            if (!paymentsForMonth.isEmpty()) {
                // Tổng hợp tất cả payments trong tháng
                Long expectedAmount = null;
                Long totalPaidAmount = 0L;
                
                for (Payment payment : paymentsForMonth) {
                    // Lấy feeSnapshot từ payment đầu tiên (tất cả payments trong tháng có cùng feeSnapshot)
                    if (expectedAmount == null) {
                        expectedAmount = payment.getFeeSnapshot();
                    }
                    // Tổng hợp số tiền đã đóng từ tất cả payments
                    totalPaidAmount += payment.getPaid() != null ? payment.getPaid() : 0L;
                }
                
                // Nếu không có feeSnapshot từ payments, dùng monthlyFee
                if (expectedAmount == null) {
                    expectedAmount = Long.valueOf((long) monthlyFee);
                }
                
                Long remainingAmount = expectedAmount - totalPaidAmount;
                
                // Xác định trạng thái thanh toán dựa trên tổng số tiền đã đóng
                MonthPaymentStatus.PaymentStatusEnum status;
                if (totalPaidAmount >= expectedAmount) {
                    // Đã thanh toán đủ
                    status = MonthPaymentStatus.PaymentStatusEnum.PAID;
                    remainingAmount = 0L;
                } else if (totalPaidAmount > 0) {
                    // Đã đóng một phần nhưng chưa đủ
                    status = MonthPaymentStatus.PaymentStatusEnum.PARTIAL;
                } else {
                    // Chưa đóng gì
                    status = MonthPaymentStatus.PaymentStatusEnum.UNPAID;
                }
                
                monthPaymentStatus = MonthPaymentStatus.builder()
                        .month(billingMonthInstant)
                        .expectedAmount(expectedAmount)
                        .paidAmount(totalPaidAmount)
                        .remainingAmount(remainingAmount)
                        .status(status)
                        .build();
            } else {
                // Chưa có payment record cho tháng này - chưa thanh toán
                monthPaymentStatus = MonthPaymentStatus.builder()
                        .month(billingMonthInstant)
                        .expectedAmount(Long.valueOf((long) monthlyFee))
                        .paidAmount(Long.valueOf(0L))
                        .remainingAmount(Long.valueOf((long) monthlyFee))
                        .status(MonthPaymentStatus.PaymentStatusEnum.UNPAID)
                        .build();
            }
            
            monthPaymentStatuses.add(monthPaymentStatus);
            
            // Chuyển sang tháng tiếp theo
            month = month.plusMonths(1);
        }
        
        return monthPaymentStatuses;
    }
}
