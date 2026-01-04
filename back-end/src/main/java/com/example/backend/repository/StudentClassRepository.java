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
import java.util.Optional;

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
}
