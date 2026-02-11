package com.example.backend.service;

import com.example.backend.dto.student.ClassHistoryResponse;
import com.example.backend.dto.student.MonthPaymentStatus;
import com.example.backend.dto.student.SessionPaymentStatusDTO;
import com.example.backend.dto.student.UpdateStudentShiftRequest;
import com.example.backend.dto.student.BulkUpdateStudentShiftRequest;
import com.example.backend.dto.student.RemoveStudentsFromClassRequest;
import com.example.backend.dto.student.StudentRequest;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.ClassShift;
import com.example.backend.entity.Payment;
import com.example.backend.entity.Student;
import com.example.backend.entity.StudentClass;
import com.example.backend.enums.StudentClassStatus;
import com.example.backend.enums.StudentStatus;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.ClassShiftRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.StudentClassRepository;
import com.example.backend.repository.StudentRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.SecurityUtil;
import com.example.backend.exception.CustomException;
import com.example.backend.entity.User;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentClassRepository studentClassRepository;
    private final ClassRepository classRepository;
    private final PaymentRepository paymentRepository;
    private final ClassShiftRepository classShiftRepository;
    private final ModelMapper modelMapper;
    private final SessionPaymentService sessionPaymentService;
    private final UserRepository userRepository;

    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }

    private StudentResponse buildStudentResponseWithCurrentClass(String studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

        StudentResponse studentResponse = modelMapper.map(student, StudentResponse.class);
        StudentClass studentClass = getClassByStudent(studentId);

        if (studentClass != null) {
            Class classDB = studentClass.getClazz();
            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClass.getJoinedAt());
            studentClassResponse.setMonthlyFee(classDB.getMonthlyFee());
            if (studentClass.getClassShift() != null) {
                studentClassResponse.setShiftId(studentClass.getClassShift().getId());
                studentClassResponse.setShiftName(studentClass.getClassShift().getName());
            }
            studentResponse.setClazz(studentClassResponse);

            List<MonthPaymentStatus> monthPaymentStatuses = calculateMonthPaymentStatuses(
                    student.getId(),
                    classDB.getId(),
                    studentClass.getJoinedAt(),
                    classDB.getMonthlyFee()
            );
            studentResponse.setMonthPaymentStatuses(monthPaymentStatuses);
            
            // Tính session-based payment statuses (mới)
            List<SessionPaymentStatusDTO> sessionPaymentStatuses = sessionPaymentService.calculateSessionPaymentStatuses(
                    student.getId(),
                    classDB.getId(),
                    studentClass.getJoinedAt(),
                    classDB.getMonthlyFee()
            );
            studentResponse.setSessionPaymentStatuses(sessionPaymentStatuses);
        }

        return studentResponse;
    }

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
            studentClassResponse.setMonthlyFee(classDB.getMonthlyFee());
            if (studentClass.getClassShift() != null) {
                studentClassResponse.setShiftId(studentClass.getClassShift().getId());
                studentClassResponse.setShiftName(studentClass.getClassShift().getName());
            }

            studentResponse.setClazz(studentClassResponse);
            
            // Tính toán trạng thái thanh toán của tất cả các tháng từ joinAt đến hiện tại
            List<MonthPaymentStatus> monthPaymentStatuses = calculateMonthPaymentStatuses(
                    studentResponse.getId(),
                    classDB.getId(),
                    studentClass.getJoinedAt(),
                    classDB.getMonthlyFee()
            );
            studentResponse.setMonthPaymentStatuses(monthPaymentStatuses);
            
            // Tính session-based payment statuses (mới)
            List<SessionPaymentStatusDTO> sessionPaymentStatuses = sessionPaymentService.calculateSessionPaymentStatuses(
                    studentResponse.getId(),
                    classDB.getId(),
                    studentClass.getJoinedAt(),
                    classDB.getMonthlyFee()
            );
            studentResponse.setSessionPaymentStatuses(sessionPaymentStatuses);

            studentResponseList.add(studentResponse);
        }
        return studentResponseList;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsByClass(String classId) {
        List<StudentResponse> studentResponseList = new ArrayList<>();
        classRepository.findById(classId).orElseThrow(() -> new NotFoundException("Không tìm thấy " +
                "lớp" +
                " học"));
        List<Student> studentList = studentClassRepository.findStudentsByClass(classId, StudentClassStatus.STUDYING, StudentStatus.ACTIVE);


        for (Student s : studentList) {
            StudentResponse studentResponse = modelMapper.map(s, StudentResponse.class);
            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();

            StudentClass studentClass = getClassByStudent(studentResponse.getId());
            Class studentClassDB = studentClass.getClazz();
            studentClassResponse.setId(studentClassDB.getId());
            studentClassResponse.setName(studentClassDB.getName());
            studentClassResponse.setJoinAt(studentClass.getJoinedAt());
            studentClassResponse.setMonthlyFee(studentClassDB.getMonthlyFee());
            if (studentClass.getClassShift() != null) {
                studentClassResponse.setShiftId(studentClass.getClassShift().getId());
                studentClassResponse.setShiftName(studentClass.getClassShift().getName());
            }

            studentResponse.setClazz(studentClassResponse);
            
            // Tính toán trạng thái thanh toán của tất cả các tháng từ joinAt đến hiện tại
            List<MonthPaymentStatus> monthPaymentStatuses = calculateMonthPaymentStatuses(
                    studentResponse.getId(),
                    classId,
                    studentClass.getJoinedAt(),
                    studentClassDB.getMonthlyFee()
            );
            studentResponse.setMonthPaymentStatuses(monthPaymentStatuses);

            List<SessionPaymentStatusDTO> sessionPaymentStatuses = sessionPaymentService.calculateSessionPaymentStatuses(
                    studentResponse.getId(),
                    classId,
                    studentClass.getJoinedAt(),
                    studentClassDB.getMonthlyFee()
            );
            studentResponse.setSessionPaymentStatuses(sessionPaymentStatuses);

            studentResponseList.add(studentResponse);
        }
        return studentResponseList;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsByClassShift(String classShiftId) {
        List<StudentResponse> studentResponseList = new ArrayList<>();
        List<Student> studentList = studentClassRepository.findStudentsByClassShift(
                classShiftId,
                StudentClassStatus.STUDYING,
                StudentStatus.ACTIVE
        );

        for (Student s : studentList) {
            StudentResponse studentResponse = modelMapper.map(s, StudentResponse.class);
            StudentClass studentClass = getClassByStudent(studentResponse.getId());
            if (studentClass != null) {
                Class classDB = studentClass.getClazz();
                StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
                studentClassResponse.setId(classDB.getId());
                studentClassResponse.setName(classDB.getName());
                studentClassResponse.setJoinAt(studentClass.getJoinedAt());
                studentClassResponse.setMonthlyFee(classDB.getMonthlyFee());
                if (studentClass.getClassShift() != null) {
                    studentClassResponse.setShiftId(studentClass.getClassShift().getId());
                    studentClassResponse.setShiftName(studentClass.getClassShift().getName());
                }
                studentResponse.setClazz(studentClassResponse);

                List<MonthPaymentStatus> monthPaymentStatuses = calculateMonthPaymentStatuses(
                        studentResponse.getId(),
                        classDB.getId(),
                        studentClass.getJoinedAt(),
                        classDB.getMonthlyFee()
                );
                studentResponse.setMonthPaymentStatuses(monthPaymentStatuses);
            }

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
        // Ca học là tùy chọn, có thể để trống và thêm vào sau
        if (studentRequest.getClassShiftId() != null && !studentRequest.getClassShiftId().trim().isEmpty()) {
            ClassShift shift = classShiftRepository.findById(studentRequest.getClassShiftId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy ca học"));
            // Đảm bảo ca thuộc đúng lớp
            if (!shift.getClazz().getId().equals(classDB.getId())) {
                throw new NotFoundException("Ca học không thuộc lớp đã chọn");
            }
            studentClass.setClassShift(shift);
        }
        // Nếu không có ca học, studentClass.getClassShift() sẽ là null, có thể thêm sau bằng updateStudentShift
        StudentClass studentClassDB = studentClassRepository.save(studentClass);

        StudentResponse studentResponse = modelMapper.map(student, StudentResponse.class);
        StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
        studentClassResponse.setId(classDB.getId());
        studentClassResponse.setName(classDB.getName());
        studentClassResponse.setJoinAt(studentClassDB.getJoinedAt());
        studentClassResponse.setMonthlyFee(classDB.getMonthlyFee());
        if (studentClassDB.getClassShift() != null) {
            studentClassResponse.setShiftId(studentClassDB.getClassShift().getId());
            studentClassResponse.setShiftName(studentClassDB.getClassShift().getName());
        }
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

        // Check if classId is empty or null - remove student from class
        if (studentRequest.getClassId() == null || studentRequest.getClassId().trim().isEmpty()) {
            // Remove student from current class
            if (studentClassDB != null) {
                studentClassDB.setLeftAt(Instant.now());
                studentClassDB.setStatus(StudentClassStatus.DROPPED);
                studentClassRepository.save(studentClassDB);
            }
            // Don't set class in response - student has no class
            return studentResponse;
        }

        if (studentClassDB == null) {
            // Student has no current class, create new one
            Class classDB = classRepository.findById(studentRequest.getClassId()).orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
            StudentClass studentClass = new StudentClass();
            studentClass.setStudent(student);
            studentClass.setClazz(classDB);
            studentClass.setJoinedAt(Instant.now());
            studentClass.setStatus(StudentClassStatus.STUDYING);
            if (studentRequest.getClassShiftId() != null) {
                ClassShift shift = classShiftRepository.findById(studentRequest.getClassShiftId())
                        .orElseThrow(() -> new NotFoundException("Không tìm thấy ca học"));
                if (!shift.getClazz().getId().equals(classDB.getId())) {
                    throw new NotFoundException("Ca học không thuộc lớp đã chọn");
                }
                studentClass.setClassShift(shift);
            }
            studentClassDB = studentClassRepository.save(studentClass);

            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClassDB.getJoinedAt());
            studentClassResponse.setMonthlyFee(classDB.getMonthlyFee());
            if (studentClassDB.getClassShift() != null) {
                studentClassResponse.setShiftId(studentClassDB.getClassShift().getId());
                studentClassResponse.setShiftName(studentClassDB.getClassShift().getName());
            }
            studentResponse.setClazz(studentClassResponse);
        } else if (studentClassDB != null && !studentRequest.getClassId().equals(studentClassDB.getClazz().getId())) {
            // Student is changing class, create new StudentClass entry
            studentClassDB.setLeftAt(Instant.now());
            studentClassDB.setStatus(StudentClassStatus.CHANGING);
            studentClassRepository.save(studentClassDB);

            StudentClass studentClass = new StudentClass();
            Class classDB = classRepository.findById(studentRequest.getClassId()).orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
            studentClass.setJoinedAt(Instant.now());
            studentClass.setStatus(StudentClassStatus.STUDYING);
            studentClass.setClazz(classDB);
            studentClass.setStudent(studentDB);
            if (studentRequest.getClassShiftId() != null) {
                ClassShift shift = classShiftRepository.findById(studentRequest.getClassShiftId())
                        .orElseThrow(() -> new NotFoundException("Không tìm thấy ca học"));
                if (!shift.getClazz().getId().equals(classDB.getId())) {
                    throw new NotFoundException("Ca học không thuộc lớp đã chọn");
                }
                studentClass.setClassShift(shift);
            }
            StudentClass studentClassResponseDB = studentClassRepository.save(studentClass);

            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClassResponseDB.getJoinedAt());
            studentClassResponse.setMonthlyFee(classDB.getMonthlyFee());
            if (studentClassResponseDB.getClassShift() != null) {
                studentClassResponse.setShiftId(studentClassResponseDB.getClassShift().getId());
                studentClassResponse.setShiftName(studentClassResponseDB.getClassShift().getName());
            }
            studentResponse.setClazz(studentClassResponse);
        } else if (studentClassDB != null && studentRequest.getClassId().equals(studentClassDB.getClazz().getId())) {
            // Student stays in the same class, only update shift if provided
            if (studentRequest.getClassShiftId() != null) {
                ClassShift shift = classShiftRepository.findById(studentRequest.getClassShiftId())
                        .orElseThrow(() -> new NotFoundException("Không tìm thấy ca học"));
                if (!shift.getClazz().getId().equals(studentClassDB.getClazz().getId())) {
                    throw new NotFoundException("Ca học không thuộc lớp đã chọn");
                }
                studentClassDB.setClassShift(shift);
            } else {
                // If classShiftId is null or empty, remove the shift
                studentClassDB.setClassShift(null);
            }
            studentClassDB = studentClassRepository.save(studentClassDB);

            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
            studentClassResponse.setId(studentClassDB.getClazz().getId());
            studentClassResponse.setName(studentClassDB.getClazz().getName());
            studentClassResponse.setJoinAt(studentClassDB.getJoinedAt());
            studentClassResponse.setMonthlyFee(studentClassDB.getClazz().getMonthlyFee());
            if (studentClassDB.getClassShift() != null) {
                studentClassResponse.setShiftId(studentClassDB.getClassShift().getId());
                studentClassResponse.setShiftName(studentClassDB.getClassShift().getName());
            }
            studentResponse.setClazz(studentClassResponse);
        }

        return studentResponse;
    }

    /**
     * Update class shift for a single student (only updates the current StudentClass record with status STUDYING).
     * - Requires student is currently studying in the provided classId.
     * - classShiftId is optional; if null/blank => remove shift.
     */
    @Transactional
    public StudentResponse updateStudentShift(UpdateStudentShiftRequest request) {
        if (request == null || isBlank(request.getStudentId()) || isBlank(request.getClassId())) {
            throw new NotFoundException("Thiếu thông tin học viên hoặc lớp học");
        }

        // Ensure student exists
        studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

        // Ensure class exists
        classRepository.findById(request.getClassId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        StudentClass studentClass = studentClassRepository.findCurrentClassByStudent(request.getStudentId(), StudentClassStatus.STUDYING);
        if (studentClass == null) {
            throw new NotFoundException("Học viên chưa thuộc lớp nào");
        }
        if (studentClass.getClazz() == null || !request.getClassId().equals(studentClass.getClazz().getId())) {
            throw new NotFoundException("Học viên không thuộc lớp đã chọn");
        }

        if (isBlank(request.getClassShiftId())) {
            studentClass.setClassShift(null);
        } else {
            ClassShift shift = classShiftRepository.findById(request.getClassShiftId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy ca học"));
            if (shift.getClazz() == null || !request.getClassId().equals(shift.getClazz().getId())) {
                throw new NotFoundException("Ca học không thuộc lớp đã chọn");
            }
            studentClass.setClassShift(shift);
        }

        studentClassRepository.save(studentClass);
        return buildStudentResponseWithCurrentClass(request.getStudentId());
    }

    /**
     * Bulk update class shift for multiple students in the same class.
     * - Atomic: if any student fails validation, the whole transaction rolls back.
     */
    @Transactional
    public List<StudentResponse> updateStudentsShift(BulkUpdateStudentShiftRequest request) {
        if (request == null || isBlank(request.getClassId()) || request.getStudentIds() == null || request.getStudentIds().isEmpty()) {
            throw new NotFoundException("Thiếu danh sách học viên hoặc lớp học");
        }

        // Ensure class exists once
        classRepository.findById(request.getClassId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        List<StudentResponse> results = new ArrayList<>();
        for (String studentId : request.getStudentIds()) {
            UpdateStudentShiftRequest single = UpdateStudentShiftRequest.builder()
                    .studentId(studentId)
                    .classId(request.getClassId())
                    .classShiftId(request.getClassShiftId())
                    .build();
            results.add(updateStudentShift(single));
        }
        return results;
    }

    /**
     * Remove one or many students from their current class (only the current StudentClass with status STUDYING).
     * - One API for both single & bulk: send studentIds array.
     * - If classId is provided, validate student currently belongs to that class.
     * - Marks StudentClass as DROPPED and sets leftAt = now, clears classShift.
     * - Atomic: if any student fails validation, the whole transaction rolls back.
     */
    @Transactional
    public List<StudentResponse> removeStudentsFromClass(RemoveStudentsFromClassRequest request) {
        if (request == null || request.getStudentIds() == null || request.getStudentIds().isEmpty()) {
            throw new NotFoundException("Thiếu danh sách học viên");
        }

        // Validate class exists if caller provided classId
        if (!isBlank(request.getClassId())) {
            classRepository.findById(request.getClassId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
        }

        List<StudentResponse> results = new ArrayList<>();
        for (String studentId : request.getStudentIds()) {
            // Ensure student exists
            studentRepository.findById(studentId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

            StudentClass studentClass = studentClassRepository.findCurrentClassByStudent(studentId, StudentClassStatus.STUDYING);
            if (studentClass == null) {
                throw new NotFoundException("Học viên chưa thuộc lớp nào");
            }

            if (!isBlank(request.getClassId())) {
                if (studentClass.getClazz() == null || !request.getClassId().equals(studentClass.getClazz().getId())) {
                    throw new NotFoundException("Học viên không thuộc lớp đã chọn");
                }
            }

            studentClass.setClassShift(null);
            studentClass.setLeftAt(Instant.now());
            studentClass.setStatus(StudentClassStatus.DROPPED);
            studentClassRepository.save(studentClass);

            // After removal, student has no current class => response without clazz
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));
            results.add(modelMapper.map(student, StudentResponse.class));
        }

        return results;
    }

    @Transactional(readOnly = true)
    public StudentResponse getStudentById(String id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

        // Kiểm tra quyền truy cập cho giáo viên
        String currentUsername = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new CustomException("Không tìm thấy thông tin người dùng", HttpStatus.UNAUTHORIZED));
        
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new CustomException("Không tìm thấy người dùng", HttpStatus.UNAUTHORIZED));
        
        // Nếu là giáo viên, kiểm tra xem học viên có thuộc lớp mà giáo viên đang dạy không
        if ("ROLE_TEACHER".equals(currentUser.getRole())) {
            StudentClass studentClass = getClassByStudent(id);
            if (studentClass == null) {
                throw new CustomException("Học viên chưa thuộc lớp nào", HttpStatus.FORBIDDEN);
            }
            
            Class classDB = studentClass.getClazz();
            if (classDB.getTeacher() == null || !classDB.getTeacher().getId().equals(currentUser.getId())) {
                throw new CustomException("Bạn không có quyền xem thông tin học viên này", HttpStatus.FORBIDDEN);
            }
        }

        StudentResponse studentResponse = modelMapper.map(student, StudentResponse.class);
        StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();

        StudentClass studentClass = getClassByStudent(studentResponse.getId());
        if (studentClass != null) {
            Class classDB = studentClass.getClazz();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClass.getJoinedAt());
            studentClassResponse.setMonthlyFee(classDB.getMonthlyFee());
            if (studentClass.getClassShift() != null) {
                studentClassResponse.setShiftId(studentClass.getClassShift().getId());
                studentClassResponse.setShiftName(studentClass.getClassShift().getName());
            }
            studentResponse.setClazz(studentClassResponse);
            
            // Tính toán trạng thái thanh toán của tất cả các tháng từ joinAt đến hiện tại
            List<MonthPaymentStatus> monthPaymentStatuses = calculateMonthPaymentStatuses(
                    student.getId(),
                    classDB.getId(),
                    studentClass.getJoinedAt(),
                    classDB.getMonthlyFee()
            );
            studentResponse.setMonthPaymentStatuses(monthPaymentStatuses);
            
            // Tính session-based payment statuses (mới)
            List<SessionPaymentStatusDTO> sessionPaymentStatuses = sessionPaymentService.calculateSessionPaymentStatuses(
                    student.getId(),
                    classDB.getId(),
                    studentClass.getJoinedAt(),
                    classDB.getMonthlyFee()
            );
            studentResponse.setSessionPaymentStatuses(sessionPaymentStatuses);
        }

        return studentResponse;
    }

    /**
     * Tính toán trạng thái thanh toán của tất cả các tháng từ joinAt đến tháng hiện tại
     * Nếu có payment cho các tháng trước tháng hiện tại, cũng hiển thị các tháng đó
     * @param studentId ID của học viên
     * @param joinAt Thời gian tham gia lớp
     * @param monthlyFee Học phí hàng tháng
     * @return Danh sách trạng thái thanh toán của tất cả các tháng
     */
    private List<MonthPaymentStatus> calculateMonthPaymentStatuses(String studentId, String classId, Instant joinAt, int monthlyFee) {
        List<MonthPaymentStatus> monthPaymentStatuses = new ArrayList<>();
        
        if (joinAt == null) {
            return monthPaymentStatuses;
        }
        
        // Chuyển joinAt sang LocalDate để tính tháng
        LocalDate joinDate = joinAt.atZone(ZoneId.systemDefault()).toLocalDate();
        YearMonth joinMonth = YearMonth.from(joinDate);
        
        // Tháng hiện tại
        YearMonth currentMonth = YearMonth.now();
        
        // Lấy tất cả payments của student để tìm các tháng có payment (có thể là tháng trước)
        List<Payment> allPayments = paymentRepository.findByStudentIdAndClazzId(studentId, classId, joinAt, Instant.now());
        Set<YearMonth> monthsWithPayments = new HashSet<>();
        
        // Tìm tất cả các tháng có payment
        for (Payment payment : allPayments) {
            if (payment.getBillingMonth() != null) {
                LocalDate billingDate = payment.getBillingMonth().atZone(ZoneOffset.UTC).toLocalDate();
                YearMonth paymentMonth = YearMonth.from(billingDate);
                monthsWithPayments.add(paymentMonth);
            }
        }
        
        // Tạo set để lưu các tháng cần hiển thị
        Set<YearMonth> monthsToShow = new HashSet<>();
        
        // Thêm các tháng từ joinMonth đến currentMonth
        YearMonth month = joinMonth;
        while (!month.isAfter(currentMonth)) {
            monthsToShow.add(month);
            month = month.plusMonths(1);
        }
        
        // Thêm các tháng có payment (nếu có payment cho tháng trước, cũng hiển thị)
        monthsToShow.addAll(monthsWithPayments);
        
        // Sắp xếp các tháng theo thứ tự
        List<YearMonth> sortedMonths = monthsToShow.stream()
                .sorted()
                .collect(Collectors.toList());
        
        // Tính toán trạng thái thanh toán cho từng tháng
        for (YearMonth yearMonth : sortedMonths) {
            // Tạo Instant cho ngày đầu tháng trong UTC (ví dụ: 2025-10-01 00:00:00 UTC)
            LocalDate firstDayOfMonth = yearMonth.atDay(1);
            Instant billingMonthInstant = firstDayOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant();
            
            // Lấy tất cả payments của tháng này để tổng hợp
            List<Payment> paymentsForMonth = paymentRepository.findAllByStudentIdAndClassIdAndBillingMonth(studentId, classId, billingMonthInstant);

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
                // Chưa có payment record cho tháng này
                // Chỉ hiển thị nếu tháng này nằm trong khoảng từ joinMonth đến currentMonth
                // (không hiển thị các tháng trước nếu không có payment)
                if (!yearMonth.isBefore(joinMonth) && !yearMonth.isAfter(currentMonth)) {
                    monthPaymentStatus = MonthPaymentStatus.builder()
                            .month(billingMonthInstant)
                            .expectedAmount(Long.valueOf((long) monthlyFee))
                            .paidAmount(Long.valueOf(0L))
                            .remainingAmount(Long.valueOf((long) monthlyFee))
                            .status(MonthPaymentStatus.PaymentStatusEnum.UNPAID)
                            .build();
                } else {
                    // Bỏ qua tháng này nếu không có payment và nằm ngoài khoảng joinMonth đến currentMonth
                    continue;
                }
            }
            
            monthPaymentStatuses.add(monthPaymentStatus);
        }
        
        return monthPaymentStatuses;
    }

    @Transactional(readOnly = true)
    public List<ClassHistoryResponse> getClassHistory(String studentId) {
        List<StudentClass> studentClasses = studentClassRepository.findAllByStudentId(studentId);
        List<ClassHistoryResponse> classHistoryList = new ArrayList<>();

        for (StudentClass studentClass : studentClasses) {
            ClassHistoryResponse.ClassHistoryResponseBuilder builder = ClassHistoryResponse.builder()
                    .id(studentClass.getId())
                    .classId(studentClass.getClazz().getId())
                    .className(studentClass.getClazz().getName())
                    .joinedAt(studentClass.getJoinedAt())
                    .leftAt(studentClass.getLeftAt())
                    .status(studentClass.getStatus());

            classHistoryList.add(builder.build());
        }

        return classHistoryList;
    }
}
