package com.example.backend.service;

import com.example.backend.dto.attendance.AttendanceRequest;
import com.example.backend.dto.attendance.AttendanceResponse;
import com.example.backend.entity.Attendance;
import com.example.backend.entity.Class;
import com.example.backend.entity.Student;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.AttendanceRepository;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;

    @Transactional
    public AttendanceResponse createAttendance(AttendanceRequest request) {
        // Validate student
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

        // Validate class
        Class clazz = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        // Calculate session number based on sessionDate
        Integer sessionNumber = calculateSessionNumber(request.getStudentId(), request.getClassId(), request.getSessionDate());

        // Check if attendance already exists for this date
        LocalDate sessionLocalDate = request.getSessionDate().atZone(ZoneId.systemDefault()).toLocalDate();
        attendanceRepository.findByStudentIdAndClazzIdOrderBySessionNumberAsc(
                request.getStudentId(), request.getClassId())
                .stream()
                .filter(att -> {
                    LocalDate attDate = att.getSessionDate().atZone(ZoneId.systemDefault()).toLocalDate();
                    return attDate.equals(sessionLocalDate);
                })
                .findFirst()
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Ngày " + sessionLocalDate + " đã được điểm danh");
                });

        // Create attendance
        Attendance attendance = Attendance.builder()
                .student(student)
                .clazz(clazz)
                .sessionDate(request.getSessionDate())
                .sessionNumber(sessionNumber)
                .status(request.getStatus())
                .notes(request.getNotes())
                .build();

        Attendance savedAttendance = attendanceRepository.save(attendance);

        // Note: Việc tự động tạo gói thanh toán sẽ được xử lý ở một service riêng
        // để tránh circular dependency

        return mapToResponse(savedAttendance);
    }

    /**
     * Bulk upsert attendance theo danh sách request.
     * - Nếu học viên đã có record trong cùng lớp và cùng ngày: update status/notes
     * - Nếu chưa có: create mới (tính sessionNumber theo sessionDate)
     */
    @Transactional
    public List<AttendanceResponse> upsertBulkAttendance(List<AttendanceRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            return List.of();
        }

        // Group theo (classId + localDate) để tối ưu query theo ngày
        Map<String, List<AttendanceRequest>> grouped = requests.stream()
                .collect(Collectors.groupingBy(req -> {
                    LocalDate date = req.getSessionDate().atZone(ZoneId.systemDefault()).toLocalDate();
                    return req.getClassId() + "|" + date;
                }));

        List<AttendanceResponse> result = new ArrayList<>();

        for (Map.Entry<String, List<AttendanceRequest>> entry : grouped.entrySet()) {
            List<AttendanceRequest> groupRequests = entry.getValue();
            if (groupRequests.isEmpty()) continue;

            String classId = groupRequests.get(0).getClassId();
            LocalDate localDate = groupRequests.get(0).getSessionDate().atZone(ZoneId.systemDefault()).toLocalDate();

            // Validate class 1 lần / group
            Class clazz = classRepository.findById(classId)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

            // Load students theo ids (1 query)
            Set<String> studentIds = groupRequests.stream().map(AttendanceRequest::getStudentId).collect(Collectors.toSet());
            Map<String, Student> studentMap = studentRepository.findAllById(studentIds).stream()
                    .collect(Collectors.toMap(Student::getId, Function.identity()));
            if (studentMap.size() != studentIds.size()) {
                throw new NotFoundException("Không tìm thấy một hoặc nhiều học viên");
            }

            // Load existing attendance theo class + ngày (1 query)
            ZonedDateTime startOfDay = localDate.atStartOfDay(ZoneId.systemDefault());
            Instant start = startOfDay.toInstant();
            Instant end = startOfDay.plusDays(1).minusNanos(1).toInstant();
            List<Attendance> existingForDay = attendanceRepository.findByClazzIdAndSessionDateBetween(classId, start, end);
            Map<String, Attendance> existingByStudentId = new HashMap<>();
            for (Attendance att : existingForDay) {
                existingByStudentId.put(att.getStudent().getId(), att);
            }

            for (AttendanceRequest req : groupRequests) {
                Student student = studentMap.get(req.getStudentId());

                Attendance existing = existingByStudentId.get(req.getStudentId());
                if (existing != null) {
                    // Update
                    existing.setStatus(req.getStatus());
                    existing.setNotes(req.getNotes());
                    // normalize sessionDate về request (nếu FE gửi time khác nhau)
                    existing.setSessionDate(req.getSessionDate());
                    Attendance saved = attendanceRepository.save(existing);
                    result.add(mapToResponse(saved));
                } else {
                    // Create
                    Integer sessionNumber = calculateSessionNumber(req.getStudentId(), classId, req.getSessionDate());
                    Attendance attendance = Attendance.builder()
                            .student(student)
                            .clazz(clazz)
                            .sessionDate(req.getSessionDate())
                            .sessionNumber(sessionNumber)
                            .status(req.getStatus())
                            .notes(req.getNotes())
                            .build();
                    Attendance saved = attendanceRepository.save(attendance);
                    result.add(mapToResponse(saved));
                }
            }
        }

        return result;
    }

    /**
     * Calculate session number based on existing attendance count
     */
    private Integer calculateSessionNumber(String studentId, String classId, Instant sessionDate) {
        // Get all attendance records for this student and class before the session date
        List<Attendance> previousAttendances = attendanceRepository
                .findByStudentIdAndClazzIdOrderBySessionNumberAsc(studentId, classId)
                .stream()
                .filter(att -> att.getSessionDate().isBefore(sessionDate))
                .collect(Collectors.toList());

        return previousAttendances.size() + 1;
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByStudent(String studentId, String classId) {
        List<Attendance> attendances = attendanceRepository.findByStudentIdAndClazzIdOrderBySessionNumberAsc(studentId, classId);
        return attendances.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByClass(String classId) {
        List<Attendance> attendances = attendanceRepository.findByClazzIdOrderBySessionDateDesc(classId);
        return attendances.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Integer countAttendedSessions(String studentId, String classId) {
        Long count = attendanceRepository.countAttendedSessions(studentId, classId);
        return count != null ? count.intValue() : 0;
    }

    @Transactional(readOnly = true)
    public Integer getNextSessionNumber(String studentId, String classId) {
        Optional<Integer> maxSession = attendanceRepository.findMaxSessionNumber(studentId, classId);
        return maxSession.map(session -> session + 1).orElse(1);
    }

    @Transactional(readOnly = true)
    public Boolean hasCompleted8Sessions(String studentId, String classId) {
        Integer attendedCount = countAttendedSessions(studentId, classId);
        // Kiểm tra xem đã điểm danh đủ 8 buổi và là bội số của 8
        return attendedCount >= 8 && (attendedCount % 8 == 0);
    }

    @Transactional
    public AttendanceResponse updateAttendance(String id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy điểm danh"));

        // Validate student
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy học viên"));

        // Validate class
        Class clazz = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        // Recalculate session number if date changed
        Integer sessionNumber = attendance.getSessionNumber();
        if (!attendance.getSessionDate().equals(request.getSessionDate())) {
            sessionNumber = calculateSessionNumber(request.getStudentId(), request.getClassId(), request.getSessionDate());
        }

        // Update attendance
        attendance.setStudent(student);
        attendance.setClazz(clazz);
        attendance.setSessionDate(request.getSessionDate());
        attendance.setSessionNumber(sessionNumber);
        attendance.setStatus(request.getStatus());
        attendance.setNotes(request.getNotes());

        Attendance updatedAttendance = attendanceRepository.save(attendance);

        return mapToResponse(updatedAttendance);
    }

    @Transactional
    public void deleteAttendance(String id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy điểm danh"));
        attendanceRepository.delete(attendance);
    }

    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(String id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy điểm danh"));
        return mapToResponse(attendance);
    }


    private AttendanceResponse mapToResponse(Attendance attendance) {
        return AttendanceResponse.builder()
                .id(attendance.getId())
                .studentId(attendance.getStudent().getId())
                .studentName(attendance.getStudent().getFullName())
                .classId(attendance.getClazz().getId())
                .className(attendance.getClazz().getName())
                .sessionDate(attendance.getSessionDate())
                .sessionNumber(attendance.getSessionNumber())
                .status(attendance.getStatus())
                .notes(attendance.getNotes())
                .createdAt(attendance.getCreatedAt())
                .updatedAt(attendance.getUpdatedAt())
                .build();
    }
}

