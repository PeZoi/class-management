package com.example.backend.repository;

import com.example.backend.entity.Student;
import com.example.backend.entity.StudentClass;
import com.example.backend.enums.StudentClassStatus;
import com.example.backend.enums.StudentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass,Long> {
    @Query("""
        SELECT COUNT(sc)
        FROM StudentClass sc
        JOIN sc.student s
        WHERE sc.clazz.id = :classId
        AND sc.leftAt IS NULL
        AND s.status = :status
    """)
    int countActiveStudentsInClass(
            @Param("classId") String classId,
            @Param("status") StudentStatus status
    );

    @Query("""
        SELECT sc
        FROM StudentClass sc
        JOIN sc.student s
        WHERE sc.student.id = :studentId
        AND sc.leftAt IS NULL
        AND sc.status = :classStatus
    """)
    StudentClass findCurrentClassByStudent(@Param("studentId") String studentId, @Param("classStatus") StudentClassStatus classStatus); // Lớp học nào đang học của học viên

    @Query("""
        SELECT sc.student
        FROM StudentClass sc
        WHERE sc.clazz.id = :classId
        AND sc.leftAt IS NULL
        AND sc.status = :classStatus
        AND sc.student.status = :studentStatus
    """)
        List<Student> findStudentsByClass(
                @Param("classId") String classId,
                @Param("classStatus") StudentClassStatus classStatus,
                @Param("studentStatus") StudentStatus studentStatus
        ); // Lấy tất cả học sinh của 1 lớp học

    @Query("""
        SELECT sc.student
        FROM StudentClass sc
        WHERE sc.classShift.id = :classShiftId
        AND sc.leftAt IS NULL
        AND sc.status = :classStatus
        AND sc.student.status = :studentStatus
    """)
    List<Student> findStudentsByClassShift(
            @Param("classShiftId") String classShiftId,
            @Param("classStatus") StudentClassStatus classStatus,
            @Param("studentStatus") StudentStatus studentStatus
    ); // Lấy tất cả học sinh của 1 ca học trong lớp

    @Query("""
        SELECT sc
        FROM StudentClass sc
        WHERE sc.student.id = :studentId
        ORDER BY sc.joinedAt DESC
    """)
    List<StudentClass> findAllByStudentId(@Param("studentId") String studentId); // Lấy tất cả lịch sử lớp học của học viên

    // Tìm tất cả bản ghi StudentClass đang gắn với một ca học cụ thể
    List<StudentClass> findByClassShift_Id(String classShiftId);

    @Query("""
        SELECT sc
        FROM StudentClass sc
        WHERE sc.clazz.id = :classId
        AND sc.leftAt IS NULL
        AND sc.status = :status
    """)
    List<StudentClass> findActiveByClassId(
            @Param("classId") String classId,
            @Param("status") com.example.backend.enums.StudentClassStatus status
    );
}
