package com.example.backend.repository;

import com.example.backend.entity.Class;
import com.example.backend.entity.ClassShift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClassShiftRepository extends JpaRepository<ClassShift, String> {
    List<ClassShift> findAllByClazz(Class clazz);
}


