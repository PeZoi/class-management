package com.example.backend.repository;

import com.example.backend.entity.Class;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class,String> {
    List<Class> findAllByTeacher(User teacher);
}
