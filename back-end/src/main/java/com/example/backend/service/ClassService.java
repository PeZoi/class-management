package com.example.backend.service;

import com.example.backend.dto.classroom.ClassRequest;
import com.example.backend.dto.classroom.ClassResponse;
import com.example.backend.dto.classroom.ClassRevenueDataResponse;
import com.example.backend.dto.classroom.ClassSingleRevenueDataResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.User;
import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.StudentStatus;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.PaymentRepository;
import com.example.backend.repository.StudentClassRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ClassService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final StudentClassRepository studentClassRepository;
    private final PaymentRepository paymentRepository;
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

    public ClassResponse create(ClassRequest classRequest) {
        User teacher = userRepository.findById(classRequest.getTeacherId()).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        Class classroom = modelMapper.map(classRequest, Class.class);
        classroom.setTeacher(teacher);

        Class savedClass = classRepository.save(classroom);
        ClassResponse classResponse = modelMapper.map(savedClass, ClassResponse.class);
        
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

    public List<ClassResponse> getAllClasses() {
        List<ClassResponse> classResponses = new ArrayList<>();
        List<Class> classes = classRepository.findAll();

        for (Class c : classes) {
            ClassResponse classResponse = modelMapper.map(c, ClassResponse.class);
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
            classResponses.add(classResponse);
        }

        return classResponses;
    }

    public ClassResponse update(String classId, ClassRequest classRequest) {
        Class classDB = classRepository.findById(classId).orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
        User TeacherDB = userRepository.findById(classRequest.getTeacherId()).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        classDB.setName(classRequest.getName());
        classDB.setMonthlyFee(classRequest.getMonthlyFee());
        classDB.setTeacher(TeacherDB);
        Class savedClass = classRepository.save(classDB);
        ClassResponse classResponse = modelMapper.map(savedClass, ClassResponse.class);
        
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

    public List<ClassResponse> getClassesByTeacherId(String teacherId) {
        List<ClassResponse> classResponses = new ArrayList<>();
        User teacherDB = userRepository.findById(teacherId).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        List<Class> classesDB = classRepository.findAllByTeacher(teacherDB);

        for (Class c : classesDB) {
            ClassResponse classResponse = modelMapper.map(c, ClassResponse.class);
            int studentCount = countActiveStudents(classResponse.getId());
            int total = classResponse.getMonthlyFee() * studentCount;
            
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
            classResponses.add(classResponse);
        }

        return classResponses;
    }

    public ClassResponse getClassById(String classId) {
        Class classDB = classRepository.findById(classId).orElseThrow(() -> new NotFoundException("Không tìm thấy " +
                "lớp học"));
        ClassResponse classResponse = modelMapper.map(classDB, ClassResponse.class);
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

    // Lấy revenue data theo period (3months, 6months, 12months)
    public List<ClassRevenueDataResponse> getRevenueDataByPeriod(String period) {
        List<Class> allClasses = classRepository.findAll();
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
    public List<ClassResponse> getTop3ClassesByRevenue() {
        Instant currentMonth = getCurrentMonthStart();
        List<Class> allClasses = classRepository.findAll();
        List<ClassResponse> classResponsesWithRevenue = new ArrayList<>();

        // Tính revenue cho mỗi class trong tháng hiện tại
        for (Class c : allClasses) {
            ClassResponse classResponse = modelMapper.map(c, ClassResponse.class);
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

            classResponse.setTotal(total);
            classResponse.setCollected(collected);
            classResponse.setRevenue(revenue);
            classResponse.setStudentCount(studentCount);

            classResponsesWithRevenue.add(classResponse);
        }

        // Sắp xếp theo revenue giảm dần và lấy top 3
        classResponsesWithRevenue.sort((c1, c2) -> Integer.compare(c2.getRevenue(), c1.getRevenue()));
        
        // Lấy top 3 (hoặc ít hơn nếu có ít hơn 3 lớp)
        int topCount = Math.min(3, classResponsesWithRevenue.size());
        return classResponsesWithRevenue.subList(0, topCount);
    }
}
