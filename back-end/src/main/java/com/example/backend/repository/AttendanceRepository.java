package com.example.backend.repository;

import com.example.backend.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    // Lấy tất cả attendance của một học viên trong một lớp
    List<Attendance> findByStudentIdAndClazzIdOrderBySessionNumberAsc(String studentId, String classId);

    // Lấy attendance của một học viên trong một lớp theo session number
    Optional<Attendance> findByStudentIdAndClazzIdAndSessionNumber(String studentId, String classId, Integer sessionNumber);

    // Đếm tổng số buổi đã điểm danh (bao gồm cả PRESENT, LATE, ABSENT, EXCUSED)
    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = :studentId AND a.clazz.id = :classId")
    Long countAttendedSessions(@Param("studentId") String studentId, @Param("classId") String classId);

    // Lấy session number lớn nhất của học viên trong lớp
    @Query("SELECT MAX(a.sessionNumber) FROM Attendance a WHERE a.student.id = :studentId AND a.clazz.id = :classId")
    Optional<Integer> findMaxSessionNumber(@Param("studentId") String studentId, @Param("classId") String classId);

    // Lấy tất cả attendance trong một khoảng session numbers
    @Query("SELECT a FROM Attendance a WHERE a.student.id = :studentId AND a.clazz.id = :classId AND a.sessionNumber >= :startSession AND a.sessionNumber <= :endSession ORDER BY a.sessionNumber ASC")
    List<Attendance> findByStudentIdAndClassIdAndSessionRange(@Param("studentId") String studentId, @Param("classId") String classId, @Param("startSession") Integer startSession, @Param("endSession") Integer endSession);

    // Lấy attendance theo class
    List<Attendance> findByClazzIdOrderBySessionDateDesc(String classId);

    // Lấy attendance theo class trong khoảng thời gian (thường dùng để lọc theo 1 ngày)
    List<Attendance> findByClazzIdAndSessionDateBetween(String classId, Instant start, Instant end);
}

