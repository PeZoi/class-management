package com.example.backend.service;

import com.example.backend.dto.classroom.ClassRequest;
import com.example.backend.dto.classroom.ClassResponse;
import com.example.backend.dto.classroom.ClassRevenueDataResponse;
import com.example.backend.dto.classroom.ClassShiftResponse;
import com.example.backend.dto.classroom.ClassSingleRevenueDataResponse;
import com.example.backend.dto.student.SessionPaymentStatusDTO;
import com.example.backend.entity.Class;
import com.example.backend.entity.ClassShift;
import com.example.backend.entity.User;
import com.example.backend.entity.StudentClass;
import com.example.backend.entity.Student;
import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.StudentStatus;
import com.example.backend.enums.StudentClassStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.StudentClassRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.SecurityUtil;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClassService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final StudentClassRepository studentClassRepository;
    private final PaymentRepository paymentRepository;
    private final SessionPaymentService sessionPaymentService;
    private final ModelMapper modelMapper;

    // Lấy ra số lượng học viên đang học ở trong lớp
    public int countActiveStudents(String classId) {
        return studentClassRepository.countActiveStudentsInClass(
                classId,
                StudentStatus.ACTIVE
        );
    }

    // Lấy ngày đầu tiên của tháng hiện tại dưới dạng Instant (để so sánh với billingMonth)
    private Instant getCurrentMonthStart() {
        LocalDate now = LocalDate.now();
        LocalDate firstDayOfMonth = now.withDayOfMonth(1);
        return firstDayOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    /**
     * Tính toán tổng số gói nợ và tổng số tiền nợ cho một class
     * Chỉ tính các gói từ đầu đến gói hiện tại của mỗi học viên
     * Logic tương tự DashboardService.getStudentsWithUnpaidFees
     * Sử dụng JOIN FETCH để tránh LazyInitializationException
     */
    @Transactional(readOnly = true)
    private ClassDebtInfo calculateClassDebt(String classId) {
        // Lấy danh sách StudentClass với JOIN FETCH để tránh LazyInitializationException
        List<StudentClass> studentClasses = studentClassRepository.findActiveByClassIdWithFetches(
                classId, 
                StudentClassStatus.STUDYING, 
                StudentStatus.ACTIVE
        );

        int totalUnpaidPackages = 0;
        long totalDebtAmount = 0L;

        for (StudentClass studentClass : studentClasses) {
            Student student = studentClass.getStudent();
            Class classDB = studentClass.getClazz();
            
            // Đảm bảo classDB không null và đúng classId (đã được JOIN FETCH nên không gây LazyInitializationException)
            if (classDB == null || !classDB.getId().equals(classId)) {
                continue;
            }
            
            // Tính toán sessionPaymentStatuses cho học sinh này
            List<SessionPaymentStatusDTO> sessionPaymentStatuses = sessionPaymentService.calculateSessionPaymentStatuses(
                    student.getId(),
                    classId,
                    studentClass.getJoinedAt(),
                    classDB.getMonthlyFee()
            );

            if (sessionPaymentStatuses == null || sessionPaymentStatuses.isEmpty()) {
                continue;
            }

            // Tìm gói hiện tại (isCurrent = true)
            Optional<Integer> currentPackageNumberOpt = sessionPaymentStatuses.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsCurrent()))
                    .map(SessionPaymentStatusDTO::getPackageNumber)
                    .findFirst();

            int maxPackageNumber = sessionPaymentStatuses.stream()
                    .map(SessionPaymentStatusDTO::getPackageNumber)
                    .filter(Objects::nonNull)
                    .mapToInt(Integer::intValue)
                    .max()
                    .orElse(0);

            int currentPackageNumber = currentPackageNumberOpt.orElse(maxPackageNumber);

            if (currentPackageNumber > 0) {
                // Lọc các gói từ đầu đến gói hiện tại (<= currentPackageNumber)
                List<SessionPaymentStatusDTO> packagesUpToCurrent = sessionPaymentStatuses.stream()
                        .filter(s -> s.getPackageNumber() != null && s.getPackageNumber() <= currentPackageNumber)
                        .collect(Collectors.toList());

                // Đếm số gói nợ (UNPAID hoặc PARTIAL)
                long unpaidCount = packagesUpToCurrent.stream()
                        .filter(s -> s.getStatus() != null && 
                                (s.getStatus().name().equals("UNPAID") || s.getStatus().name().equals("PARTIAL")))
                        .count();
                totalUnpaidPackages += unpaidCount;

                // Tính tổng số tiền nợ (remainingAmount)
                long debtAmount = packagesUpToCurrent.stream()
                        .map(SessionPaymentStatusDTO::getRemainingAmount)
                        .filter(Objects::nonNull)
                        .mapToLong(Long::longValue)
                        .sum();
                totalDebtAmount += debtAmount;
            } else {
                // Nếu không có gói hiện tại, tính tất cả các gói
                long unpaidCount = sessionPaymentStatuses.stream()
                        .filter(s -> s.getStatus() != null && 
                                (s.getStatus().name().equals("UNPAID") || s.getStatus().name().equals("PARTIAL")))
                        .count();
                totalUnpaidPackages += unpaidCount;

                long debtAmount = sessionPaymentStatuses.stream()
                        .map(SessionPaymentStatusDTO::getRemainingAmount)
                        .filter(Objects::nonNull)
                        .mapToLong(Long::longValue)
                        .sum();
                totalDebtAmount += debtAmount;
            }
        }

        return new ClassDebtInfo(totalUnpaidPackages, totalDebtAmount);
    }

    /**
     * Inner class để chứa thông tin nợ của một class
     */
    private static class ClassDebtInfo {
        final int totalUnpaidPackages;
        final long totalDebtAmount;

        ClassDebtInfo(int totalUnpaidPackages, long totalDebtAmount) {
            this.totalUnpaidPackages = totalUnpaidPackages;
            this.totalDebtAmount = totalDebtAmount;
        }
    }

    private List<ClassShiftResponse> mapClassShifts(Class classroom) {
        if (classroom.getClassShifts() == null) {
            return List.of();
        }
        return classroom.getClassShifts()
                .stream()
                .map(this::toClassShiftResponse)
                .collect(Collectors.toList());
    }

    private ClassShiftResponse toClassShiftResponse(ClassShift shift) {
        return ClassShiftResponse.builder()
                .id(shift.getId())
                .name(shift.getName())
                .classId(shift.getClazz() != null ? shift.getClazz().getId() : null)
                .className(shift.getClazz() != null ? shift.getClazz().getName() : null)
                .build();
    }

    public ClassResponse create(ClassRequest classRequest) {
        // Không cho phép tạo mới nếu đã tồn tại lớp đang hoạt động cùng tên
        classRepository.findActiveByName(classRequest.getName())
                .ifPresent(existing -> {
                    throw new CustomException("Tên lớp đã tồn tại", HttpStatus.BAD_REQUEST);
                });

        User teacher = null;
        if (classRequest.getTeacherId() != null && !classRequest.getTeacherId().trim().isEmpty()) {
            teacher = userRepository.findById(classRequest.getTeacherId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        }
        Class classroom = modelMapper.map(classRequest, Class.class);
        classroom.setTeacher(teacher);

        Class savedClass = classRepository.save(classroom);
        ClassResponse classResponse = modelMapper.map(savedClass, ClassResponse.class);
        classResponse.setClassShifts(mapClassShifts(savedClass));
        
        // Tính toán collected, revenue, total cho class mới tạo
        int studentCount = countActiveStudents(classResponse.getId());
        int total = studentCount * classResponse.getMonthlyFee();
        
        // Class mới tạo chưa có payments nên collected và revenue = 0
        classResponse.setTotal(total);
        classResponse.setCollected(0);
        classResponse.setRevenue(0);
        classResponse.setStudentCount(studentCount);

        return classResponse;
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> getAllClasses() {
        List<ClassResponse> classResponses = new ArrayList<>();
        // Dùng findAllWithClassShifts để fetch join classShifts, tránh lazy loading, chỉ lấy lớp chưa bị xoá
        List<Class> classes = classRepository.findAllWithClassShifts();

        for (Class c : classes) {
            ClassResponse classResponse = modelMapper.map(c, ClassResponse.class);
            classResponse.setClassShifts(mapClassShifts(c));
            int studentCount = countActiveStudents(classResponse.getId());
            int total = studentCount * classResponse.getMonthlyFee();
            
            // Tính collected và revenue từ payments có direction = INCOME trong tháng hiện tại
            Instant currentMonth = getCurrentMonthStart();
            Long collectedLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
            Long revenueLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
            
            int collected = collectedLong != null ? collectedLong.intValue() : 0;
            int revenue = revenueLong != null ? revenueLong.intValue() : 0;
            
            // Tính toán nợ cho class này
            ClassDebtInfo debtInfo = calculateClassDebt(classResponse.getId());
            
            classResponse.setTotal(total);
            classResponse.setCollected(collected);
            classResponse.setRevenue(revenue);
            classResponse.setStudentCount(studentCount);
            classResponse.setTotalUnpaidPackages(debtInfo.totalUnpaidPackages);
            classResponse.setTotalDebtAmount(debtInfo.totalDebtAmount);
            classResponses.add(classResponse);
        }

        return classResponses;
    }

    public ClassResponse update(String classId, ClassRequest classRequest) {
        Class classDB = classRepository.findActiveById(classId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        // Nếu đổi tên lớp, cần kiểm tra trùng với lớp đang hoạt động khác
        String newName = classRequest.getName();
        if (newName != null && !newName.equals(classDB.getName())) {
            classRepository.findActiveByName(newName)
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(classId)) {
                            throw new CustomException("Tên lớp đã tồn tại", HttpStatus.BAD_REQUEST);
                        }
                    });
        }

        classDB.setName(classRequest.getName());
        classDB.setDescription(classRequest.getDescription());
        classDB.setMonthlyFee(classRequest.getMonthlyFee());
        if (classRequest.getTeacherId() != null && !classRequest.getTeacherId().trim().isEmpty()) {
            User teacherDB = userRepository.findById(classRequest.getTeacherId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
            classDB.setTeacher(teacherDB);
        } else {
            classDB.setTeacher(null);
        }
        Class savedClass = classRepository.save(classDB);
        ClassResponse classResponse = modelMapper.map(savedClass, ClassResponse.class);
        classResponse.setClassShifts(mapClassShifts(savedClass));
        
        // Tính toán collected, revenue, total sau khi update
        int studentCount = countActiveStudents(classResponse.getId());
        int total = studentCount * classResponse.getMonthlyFee();
        
        // Tính collected và revenue từ payments có direction = INCOME trong tháng hiện tại
        Instant currentMonth = getCurrentMonthStart();
        Long collectedLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
        Long revenueLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
        
        int collected = collectedLong != null ? collectedLong.intValue() : 0;
        int revenue = revenueLong != null ? revenueLong.intValue() : 0;
        
        classResponse.setTotal(total);
        classResponse.setCollected(collected);
        classResponse.setRevenue(revenue);
        classResponse.setStudentCount(studentCount);
        
        return classResponse;
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> getClassesByTeacherId(String teacherId) {
        List<ClassResponse> classResponses = new ArrayList<>();
        User teacherDB = userRepository.findById(teacherId).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        // Dùng findAllByTeacherWithClassShifts để fetch join classShifts
        List<Class> classesDB = classRepository.findAllByTeacherWithClassShifts(teacherDB);

        for (Class c : classesDB) {
            ClassResponse classResponse = modelMapper.map(c, ClassResponse.class);
            classResponse.setClassShifts(mapClassShifts(c));
            int studentCount = countActiveStudents(classResponse.getId());
            int total = classResponse.getMonthlyFee() * studentCount;
            
            // Tính collected và revenue từ payments có direction = INCOME trong tháng hiện tại
            Instant currentMonth = getCurrentMonthStart();
            Long collectedLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
            Long revenueLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
            
            int collected = collectedLong != null ? collectedLong.intValue() : 0;
            int revenue = revenueLong != null ? revenueLong.intValue() : 0;
            
            // Tính toán nợ cho class này
            ClassDebtInfo debtInfo = calculateClassDebt(classResponse.getId());
            
            classResponse.setTotal(total);
            classResponse.setCollected(collected);
            classResponse.setRevenue(revenue);
            classResponse.setStudentCount(studentCount);
            classResponse.setTotalUnpaidPackages(debtInfo.totalUnpaidPackages);
            classResponse.setTotalDebtAmount(debtInfo.totalDebtAmount);
            classResponses.add(classResponse);
        }

        return classResponses;
    }

    @Transactional(readOnly = true)
    public List<ClassResponse> getClassesByCurrentTeacher() {
        String username = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin người dùng"));
        
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
        
        return getClassesByTeacherId(currentUser.getId());
    }

    @Transactional(readOnly = true)
    public ClassResponse getClassById(String classId, boolean checkTeacherAccess) {
        // Dùng findByIdWithClassShifts để fetch join classShifts
        Class classDB = classRepository.findByIdWithClassShifts(classId).orElseThrow(() -> new NotFoundException("Không tìm thấy " +
                "lớp học"));
        
        // Kiểm tra quyền truy cập nếu là teacher
        if (checkTeacherAccess) {
            String username = SecurityUtil.getCurrentUserLogin().orElse(null);
            if (username != null) {
                User currentUser = userRepository.findByUsername(username).orElse(null);
                if (currentUser != null && "ROLE_TEACHER".equals(currentUser.getRole().getName())) {
                    // Teacher chỉ có thể truy cập lớp của mình
                    if (!classDB.getTeacher().getId().equals(currentUser.getId())) {
                        throw new CustomException("Bạn không có quyền truy cập lớp học này", HttpStatus.FORBIDDEN);
                    }
                }
            }
        }
        
        ClassResponse classResponse = modelMapper.map(classDB, ClassResponse.class);
        classResponse.setClassShifts(mapClassShifts(classDB));
        int studentCount = countActiveStudents(classResponse.getId());
        int total = studentCount * classResponse.getMonthlyFee();
        
        // Tính collected và revenue từ payments có direction = INCOME trong tháng hiện tại
        Instant currentMonth = getCurrentMonthStart();
        Long collectedLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
        Long revenueLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
        
        int collected = collectedLong != null ? collectedLong.intValue() : 0;
        int revenue = revenueLong != null ? revenueLong.intValue() : 0;
        
        // Tính toán nợ cho class này
        ClassDebtInfo debtInfo = calculateClassDebt(classResponse.getId());
        
        classResponse.setTotal(total);
        classResponse.setCollected(collected);
        classResponse.setRevenue(revenue);
        classResponse.setStudentCount(studentCount);
        classResponse.setTotalUnpaidPackages(debtInfo.totalUnpaidPackages);
        classResponse.setTotalDebtAmount(debtInfo.totalDebtAmount);

        return classResponse;
    }

    // Lấy revenue data theo period (3months, 6months, 12months)
    public List<ClassRevenueDataResponse> getRevenueDataByPeriod(String period) {
        // Chỉ lấy các lớp chưa bị xoá để hiển thị trên biểu đồ
        List<Class> allClasses = classRepository.findAllActive();
        // Sắp xếp classes theo id để đảm bảo thứ tự ổn định
        allClasses.sort((c1, c2) -> c1.getId().compareTo(c2.getId()));
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

        // Tạo map để lưu revenue data cho từng tháng
        List<ClassRevenueDataResponse> revenueDataList = new ArrayList<>();

        // Tạo danh sách các tháng cần lấy dữ liệu (từ tháng hiện tại ngược lại)
        for (int i = monthsToInclude - 1; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            LocalDate firstDayOfMonth = targetDate.withDayOfMonth(1);
            Instant billingMonth = firstDayOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant();

            // Tạo revenue data cho tháng này
            Map<String, Long> classRevenues = new LinkedHashMap<>();
            
            // Tính revenue cho mỗi class trong tháng này
            int classIndex = 1;
            for (Class c : allClasses) {
                Long revenue = paymentRepository.sumByClassIdAndDirectionAndMonth(
                    c.getId(), 
                    PaymentDirection.INCOME, 
                    billingMonth
                );
                if (revenue == null) {
                    revenue = 0L;
                }
                // Dùng index (1-based) làm key để match với FE format (class_1, class_2, ...)
                classRevenues.put("class_" + classIndex, revenue);
                classIndex++;
            }

            // Tạo label cho tháng
            String monthShort = "T" + targetDate.getMonthValue();
            String monthLabel = "Tháng " + targetDate.getMonthValue();

            ClassRevenueDataResponse revenueData = ClassRevenueDataResponse.builder()
                .month(monthShort)
                .label(monthLabel)
                .classRevenues(classRevenues)
                .build();

            revenueDataList.add(revenueData);
        }

        return revenueDataList;
    }

    // Lấy revenue data cho một class cụ thể theo period (3months, 6months, 12months)
    public List<ClassSingleRevenueDataResponse> getRevenueDataByClassIdAndPeriod(String classId, String period) {
        // Kiểm tra class có tồn tại không (nếu không tồn tại sẽ throw exception)
        classRepository.findById(classId)
            .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học với id: " + classId));

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

        List<ClassSingleRevenueDataResponse> revenueDataList = new ArrayList<>();

        // Tạo danh sách các tháng cần lấy dữ liệu (từ tháng hiện tại ngược lại)
        for (int i = monthsToInclude - 1; i >= 0; i--) {
            LocalDate targetDate = now.minusMonths(i);
            LocalDate firstDayOfMonth = targetDate.withDayOfMonth(1);
            Instant billingMonth = firstDayOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant();

            // Tính revenue cho class này trong tháng này
            Long revenue = paymentRepository.sumByClassIdAndDirectionAndMonth(
                classId,
                PaymentDirection.INCOME,
                billingMonth
            );
            if (revenue == null) {
                revenue = 0L;
            }

            // Tạo label cho tháng
            String monthShort = "T" + targetDate.getMonthValue();
            String monthLabel = "Tháng " + targetDate.getMonthValue();

            ClassSingleRevenueDataResponse revenueData = ClassSingleRevenueDataResponse.builder()
                .month(monthShort)
                .label(monthLabel)
                .revenue(revenue)
                .build();

            revenueDataList.add(revenueData);
        }

        return revenueDataList;
    }

    // Lấy top 3 lớp có doanh thu cao nhất theo tháng hiện tại
    @Transactional(readOnly = true)
    public List<ClassResponse> getTop3ClassesByRevenue() {
        Instant currentMonth = getCurrentMonthStart();
        // Dùng findAllWithClassShifts để fetch join classShifts, chỉ lấy lớp chưa bị xoá
        List<Class> allClasses = classRepository.findAllWithClassShifts();
        List<ClassResponse> classResponsesWithRevenue = new ArrayList<>();

        // Tính revenue cho mỗi class trong tháng hiện tại
        for (Class c : allClasses) {
            ClassResponse classResponse = modelMapper.map(c, ClassResponse.class);
            classResponse.setClassShifts(mapClassShifts(c));
            int studentCount = countActiveStudents(classResponse.getId());
            int total = studentCount * classResponse.getMonthlyFee();

            Long revenueLong = paymentRepository.sumByClassIdAndDirectionAndMonth(
                classResponse.getId(), 
                PaymentDirection.INCOME, 
                currentMonth
            );
            int revenue = revenueLong != null ? revenueLong.intValue() : 0;
            
            Long collectedLong = paymentRepository.sumByClassIdAndDirectionAndMonth(
                classResponse.getId(), 
                PaymentDirection.INCOME, 
                currentMonth
            );
            int collected = collectedLong != null ? collectedLong.intValue() : 0;

            // Tính toán nợ cho class này
            ClassDebtInfo debtInfo = calculateClassDebt(classResponse.getId());
            
            classResponse.setTotal(total);
            classResponse.setCollected(collected);
            classResponse.setRevenue(revenue);
            classResponse.setStudentCount(studentCount);
            classResponse.setTotalUnpaidPackages(debtInfo.totalUnpaidPackages);
            classResponse.setTotalDebtAmount(debtInfo.totalDebtAmount);

            classResponsesWithRevenue.add(classResponse);
        }

        // Sắp xếp theo revenue giảm dần và lấy top 3
        classResponsesWithRevenue.sort((c1, c2) -> Integer.compare(c2.getRevenue(), c1.getRevenue()));
        
        // Lấy top 3 (hoặc ít hơn nếu có ít hơn 3 lớp)
        int topCount = Math.min(3, classResponsesWithRevenue.size());
        return classResponsesWithRevenue.subList(0, topCount);
    }

    /**
     * Xoá mềm lớp học:
     * - Đánh dấu isDeleted, deletedAt, deletedBy
     * - Bỏ gán giáo viên (set teacher = null)
     * - Loại bỏ tất cả học sinh đang học lớp đó (StudentClass.status = DROPPED, leftAt = now)
     */
    @Transactional
    public void deleteClass(String classId) {
        Class classDB = classRepository.findById(classId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        // Nếu đã xoá rồi thì bỏ qua
        if (Boolean.TRUE.equals(classDB.getIsDeleted())) {
            return;
        }

        // Bỏ gán giáo viên
        classDB.setTeacher(null);

        // Cập nhật các bản ghi StudentClass đang học trong lớp này
        Instant now = Instant.now();
        List<StudentClass> activeStudentClasses = studentClassRepository.findActiveByClassId(
                classId,
                StudentClassStatus.STUDYING
        );

        // Đồng thời đổi status học viên sang INACTIVE
        for (StudentClass sc : activeStudentClasses) {
            Student student = sc.getStudent();
            if (student != null && student.getStatus() != StudentStatus.DELETED) {
                student.setStatus(StudentStatus.INACTIVE);
            }
            sc.setStatus(StudentClassStatus.DROPPED);
            sc.setLeftAt(now);
        }
        for (StudentClass sc : activeStudentClasses) {
            sc.setStatus(StudentClassStatus.DROPPED);
            sc.setLeftAt(now);
        }
        if (!activeStudentClasses.isEmpty()) {
            studentClassRepository.saveAll(activeStudentClasses);
        }

        // Đánh dấu xoá mềm cho Class
        classDB.setIsDeleted(true);
        classDB.setDeletedAt(now);
        String username = SecurityUtil.getCurrentUserLogin().orElse(null);
        classDB.setDeletedBy(username);

        classRepository.save(classDB);
    }

    /**
     * Lấy danh sách classes không có teacher (chưa được gán giáo viên)
     * @return List of ClassResponse với classShifts
     */
    @Transactional(readOnly = true)
    public List<ClassResponse> getUnassignedClasses() {
        List<ClassResponse> classResponses = new ArrayList<>();
        // Dùng findAllUnassignedClassesWithClassShifts để fetch join classShifts
        List<Class> classes = classRepository.findAllUnassignedClassesWithClassShifts();

        for (Class c : classes) {
            ClassResponse classResponse = modelMapper.map(c, ClassResponse.class);
            classResponse.setClassShifts(mapClassShifts(c));
            int studentCount = countActiveStudents(classResponse.getId());
            int total = studentCount * classResponse.getMonthlyFee();
            
            // Tính collected và revenue từ payments có direction = INCOME trong tháng hiện tại
            Instant currentMonth = getCurrentMonthStart();
            Long collectedLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
            Long revenueLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
            
            int collected = collectedLong != null ? collectedLong.intValue() : 0;
            int revenue = revenueLong != null ? revenueLong.intValue() : 0;
            
            // Tính toán nợ cho class này
            ClassDebtInfo debtInfo = calculateClassDebt(classResponse.getId());
            
            classResponse.setTotal(total);
            classResponse.setCollected(collected);
            classResponse.setRevenue(revenue);
            classResponse.setStudentCount(studentCount);
            classResponse.setTotalUnpaidPackages(debtInfo.totalUnpaidPackages);
            classResponse.setTotalDebtAmount(debtInfo.totalDebtAmount);
            classResponses.add(classResponse);
        }

        return classResponses;
    }

    /**
     * Assign teacher cho nhiều classes.
     * Danh sách classIds được coi là danh sách CUỐI CÙNG:
     * - Những lớp hiện đang dạy nhưng KHÔNG nằm trong classIds sẽ bị bỏ teacher (unassign).
     * - Những lớp trong classIds sẽ được gán teacher (nếu chưa có).
     *
     * @param teacherId ID của teacher
     * @param classIds Danh sách ID của các classes cần assign
     * @return List of ClassResponse các lớp teacher sẽ dạy sau khi cập nhật
     */
    @org.springframework.transaction.annotation.Transactional
    public List<ClassResponse> assignClassesToTeacher(String teacherId, List<String> classIds) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));

        if (!"ROLE_TEACHER".equals(teacher.getRole().getName())) {
            throw new CustomException("Chỉ có thể gán lớp cho giáo viên", HttpStatus.BAD_REQUEST);
        }

        // Đảm bảo không null
        if (classIds == null) {
            classIds = List.of();
        }

        Set<String> targetClassIds = new HashSet<>(classIds);

        // 1. Bỏ teacher khỏi các lớp hiện tại nhưng không còn trong targetClassIds
        List<Class> currentClasses = classRepository.findAllByTeacherWithClassShifts(teacher);
        for (Class clazz : currentClasses) {
            if (!targetClassIds.contains(clazz.getId())) {
                clazz.setTeacher(null);
                classRepository.save(clazz);
            }
        }

        // 2. Gán teacher cho tất cả các lớp trong targetClassIds
        List<ClassResponse> assignedClasses = new ArrayList<>();
        for (String classId : targetClassIds) {
            Class classDB = classRepository.findByIdWithClassShifts(classId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học với id: " + classId));

            classDB.setTeacher(teacher);
            Class savedClass = classRepository.save(classDB);

            ClassResponse classResponse = modelMapper.map(savedClass, ClassResponse.class);
            classResponse.setClassShifts(mapClassShifts(savedClass));
            int studentCount = countActiveStudents(classResponse.getId());
            int total = studentCount * classResponse.getMonthlyFee();

            // Tính collected và revenue từ payments có direction = INCOME trong tháng hiện tại
            Instant currentMonth = getCurrentMonthStart();
            Long collectedLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);
            Long revenueLong = paymentRepository.sumByClassIdAndDirectionAndMonth(classResponse.getId(), PaymentDirection.INCOME, currentMonth);

            int collected = collectedLong != null ? collectedLong.intValue() : 0;
            int revenue = revenueLong != null ? revenueLong.intValue() : 0;

            // Tính toán nợ cho class này
            ClassDebtInfo debtInfo = calculateClassDebt(classResponse.getId());
            
            classResponse.setTotal(total);
            classResponse.setCollected(collected);
            classResponse.setRevenue(revenue);
            classResponse.setStudentCount(studentCount);
            classResponse.setTotalUnpaidPackages(debtInfo.totalUnpaidPackages);
            classResponse.setTotalDebtAmount(debtInfo.totalDebtAmount);
            assignedClasses.add(classResponse);
        }

        return assignedClasses;
    }
}
