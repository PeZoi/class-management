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
import java.util.List;
import java.util.Optional;
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

