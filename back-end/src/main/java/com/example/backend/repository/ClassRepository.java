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
    
    // Fetch join classShifts để tránh lazy loading khi map sang DTO, chỉ lấy lớp chưa bị xoá
    @Query("SELECT DISTINCT c FROM Class c LEFT JOIN FETCH c.classShifts WHERE c.isDeleted IS NULL OR c.isDeleted = false")
    List<Class> findAllWithClassShifts();
    
    // Fetch join classShifts cho một class cụ thể (chỉ lấy lớp chưa bị xoá)
    @Query("SELECT DISTINCT c FROM Class c LEFT JOIN FETCH c.classShifts WHERE c.id = :id AND (c.isDeleted IS NULL OR c.isDeleted = false)")
    java.util.Optional<Class> findByIdWithClassShifts(String id);
    
    // Fetch join classShifts cho classes của một teacher (chỉ lấy lớp chưa bị xoá)
    @Query("SELECT DISTINCT c FROM Class c LEFT JOIN FETCH c.classShifts WHERE c.teacher = :teacher AND (c.isDeleted IS NULL OR c.isDeleted = false)")
    List<Class> findAllByTeacherWithClassShifts(User teacher);
    
    // Lấy tất cả classes không có teacher (teacher is null) và chưa bị xoá
    @Query("SELECT DISTINCT c FROM Class c LEFT JOIN FETCH c.classShifts WHERE c.teacher IS NULL AND (c.isDeleted IS NULL OR c.isDeleted = false)")
    List<Class> findAllUnassignedClassesWithClassShifts();

    // Lấy tất cả classes chưa bị xoá (dùng cho biểu đồ doanh thu)
    @Query("SELECT c FROM Class c WHERE c.isDeleted IS NULL OR c.isDeleted = false")
    List<Class> findAllActive();
}
