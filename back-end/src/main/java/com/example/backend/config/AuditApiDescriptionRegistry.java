package com.example.backend.config;

import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Nơi define tập trung mô tả cho các API quan trọng.
 *
 * Thực tế thường làm: tạo 1 registry/rule-list (method + path pattern -> description),
 * để interceptor chỉ gọi resolve(...) và không hardcode logic dài trong interceptor.
 */
@Component
public class AuditApiDescriptionRegistry {

    private final AntPathMatcher pathMatcher = new AntPathMatcher();
    private final List<Rule> rules = new ArrayList<>();

    public AuditApiDescriptionRegistry() {
        // Auth
        add(HttpMethod.POST, "/api/auth/login", "AUTH_LOGIN", "Đăng nhập hệ thống");

        // Student
        add(HttpMethod.POST, "/api/student/create", "STUDENT_CREATE", "Tạo học sinh");
        add(HttpMethod.PUT, "/api/student/update/**", "STUDENT_UPDATE", "Cập nhật học sinh");
        add(HttpMethod.PUT, "/api/student/update-shift", "STUDENT_UPDATE_SHIFT", "Cập nhật ca học cho 1 học sinh");
        add(HttpMethod.PUT, "/api/student/update-shifts", "STUDENT_UPDATE_SHIFTS", "Cập nhật ca học hàng loạt");
        add(HttpMethod.PUT, "/api/student/remove-from-class", "STUDENT_REMOVE_FROM_CLASS", "Gỡ học sinh khỏi lớp");
        add(HttpMethod.POST, "/api/student/delete", "STUDENT_DELETE", "Xoá học sinh");
        add(HttpMethod.POST, "/api/student/restore/**", "STUDENT_RESTORE", "Khôi phục học sinh");

        // Class
        add(HttpMethod.POST, "/api/class/create", "CLASS_CREATE", "Tạo lớp học");
        add(HttpMethod.PUT, "/api/class/update/**", "CLASS_UPDATE", "Cập nhật lớp học");
        add(HttpMethod.POST, "/api/class/delete/**", "CLASS_DELETE", "Xoá lớp học");

        // Class shift
        add(HttpMethod.POST, "/api/class-shift/create", "CLASS_SHIFT_CREATE", "Tạo ca học");
        add(HttpMethod.PUT, "/api/class-shift/update/**", "CLASS_SHIFT_UPDATE", "Cập nhật ca học");
        add(HttpMethod.DELETE, "/api/class-shift/**", "CLASS_SHIFT_DELETE", "Xoá ca học");

        // Attendance
        add(HttpMethod.POST, "/api/attendance/create", "ATTENDANCE_CREATE", "Tạo điểm danh");
        add(HttpMethod.POST, "/api/attendance/bulk-upsert", "ATTENDANCE_BULK_UPSERT", "Điểm danh học viên");
        add(HttpMethod.PUT, "/api/attendance/**", "ATTENDANCE_UPDATE", "Cập nhật điểm danh");
        add(HttpMethod.DELETE, "/api/attendance/**", "ATTENDANCE_DELETE", "Xoá điểm danh");

        // Payment
        add(HttpMethod.POST, "/api/payment/create", "PAYMENT_CREATE", "Tạo giao dịch thanh toán");

        // Teacher
        add(HttpMethod.POST, "/api/teacher/create", "TEACHER_CREATE", "Tạo giáo viên");
        add(HttpMethod.PUT, "/api/teacher/update/**", "TEACHER_UPDATE", "Cập nhật giáo viên");
        add(HttpMethod.PUT, "/api/teacher/reset-password/**", "TEACHER_RESET_PASSWORD", "Reset mật khẩu giáo viên");
        add(HttpMethod.DELETE, "/api/teacher/delete/**", "TEACHER_DELETE", "Xoá giáo viên");
        add(HttpMethod.POST, "/api/teacher/restore/**", "TEACHER_RESTORE", "Khôi phục giáo viên");
        add(HttpMethod.POST, "/api/teacher/**/assign-classes", "TEACHER_ASSIGN_CLASSES", "Gán lớp cho giáo viên");

        // Profile
        add(HttpMethod.PUT, "/api/profile/me", "PROFILE_UPDATE_ME", "Cập nhật hồ sơ cá nhân");
    }

    public Optional<ApiDescriptionDefinition> resolve(String method, String path) {
        if (method == null || path == null) return Optional.empty();

        for (Rule rule : rules) {
            if (rule.method.matches(method) && pathMatcher.match(rule.pathPattern, path)) {
                return Optional.of(new ApiDescriptionDefinition(rule.key, rule.defaultDescription));
            }
        }
        return Optional.empty();
    }

    private void add(HttpMethod method, String pathPattern, String key, String defaultDescription) {
        rules.add(new Rule(method, pathPattern, key, defaultDescription));
    }

    public record ApiDescriptionDefinition(String key, String defaultDescription) {
    }

    private record Rule(HttpMethod method, String pathPattern, String key, String defaultDescription) {
    }
}


