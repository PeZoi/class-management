package com.example.backend.repository;

import com.example.backend.entity.Student;
import com.example.backend.enums.Genders;
import com.example.backend.enums.StudentClassStatus;
import com.example.backend.enums.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    
    /**
     * Tìm kiếm students với pagination và filtering support
     * Search theo fullName, email, hoặc phoneNumber
     * Filter theo gender, status, className
     * Chỉ lấy lớp hiện tại (status = STUDYING) khi filter theo className
     * Khi className = '__no_class__' thì lấy học sinh không có lớp (không có StudentClass với status STUDYING)
     */
    @Query("""
        SELECT DISTINCT s FROM Student s 
        LEFT JOIN s.studentClasses sc 
        LEFT JOIN sc.clazz c
        WHERE (:search IS NULL OR :search = '' 
               OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR s.phoneNumber LIKE CONCAT('%', :search, '%'))
        AND (:gender IS NULL OR s.gender = :gender)
        AND (:status IS NULL OR s.status = :status)
        AND (
            :className IS NULL OR :className = '' 
            OR (:className = '__no_class__' AND NOT EXISTS (
                SELECT 1 FROM StudentClass sc2 
                WHERE sc2.student.id = s.id 
                AND sc2.status = :classStatus 
                AND sc2.leftAt IS NULL
            ))
            OR (c.name = :className AND sc.status = :classStatus AND sc.leftAt IS NULL)
        )
    """)
    Page<Student> findAllWithFilters(
        @Param("search") String search,
        @Param("gender") Genders gender,
        @Param("status") StudentStatus status,
        @Param("className") String className,
        @Param("classStatus") StudentClassStatus classStatus,
        Pageable pageable
    );
}
