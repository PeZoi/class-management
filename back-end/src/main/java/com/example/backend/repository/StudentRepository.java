package com.example.backend.repository;

import com.example.backend.entity.Student;
import com.example.backend.enums.Genders;
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
     * Filter theo gender, status, classId
     */
    @Query("""
        SELECT DISTINCT s FROM Student s 
        LEFT JOIN s.studentClasses sc 
        WHERE (:search IS NULL OR :search = '' 
               OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))
               OR s.phoneNumber LIKE CONCAT('%', :search, '%'))
        AND (:gender IS NULL OR s.gender = :gender)
        AND (:status IS NULL OR s.status = :status)
        AND (:classId IS NULL OR :classId = '' OR sc.clazz.id = :classId)
        ORDER BY s.createdAt DESC
    """)
    Page<Student> findAllWithFilters(
        @Param("search") String search,
        @Param("gender") Genders gender,
        @Param("status") StudentStatus status,
        @Param("classId") String classId,
        Pageable pageable
    );
}
