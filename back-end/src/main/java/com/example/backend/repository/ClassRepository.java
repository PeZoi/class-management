package com.example.backend.repository;

import com.example.backend.entity.Class;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class,String> {
    List<Class> findAllByTeacher(User teacher);
    
    // Fetch join classShifts để tránh lazy loading khi map sang DTO
    @Query("SELECT DISTINCT c FROM Class c LEFT JOIN FETCH c.classShifts")
    List<Class> findAllWithClassShifts();
    
    // Fetch join classShifts cho một class cụ thể
    @Query("SELECT DISTINCT c FROM Class c LEFT JOIN FETCH c.classShifts WHERE c.id = :id")
    java.util.Optional<Class> findByIdWithClassShifts(String id);
    
    // Fetch join classShifts cho classes của một teacher
    @Query("SELECT DISTINCT c FROM Class c LEFT JOIN FETCH c.classShifts WHERE c.teacher = :teacher")
    List<Class> findAllByTeacherWithClassShifts(User teacher);
}
