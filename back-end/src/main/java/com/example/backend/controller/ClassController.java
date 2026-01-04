package com.example.backend.controller;

import com.example.backend.dto.classroom.ClassRequest;
import com.example.backend.dto.classroom.ClassResponse;
import com.example.backend.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/class")
@RequiredArgsConstructor
public class ClassController {
    private final ClassService classService;

    @GetMapping("/get-all")
    public ResponseEntity<List<ClassResponse>> getAllClasses() {
        List<ClassResponse> classResponses = classService.getAllClasses();
        return new ResponseEntity<>(classResponses, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<ClassResponse> create(@RequestBody ClassRequest classRequest) {
        ClassResponse classResponse = classService.create(classRequest);
        return new ResponseEntity<>(classResponse, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ClassResponse> update(@PathVariable(value = "id") String classId, @RequestBody ClassRequest classRequest) {
        ClassResponse classResponse = classService.update(classId, classRequest);
        return new ResponseEntity<>(classResponse, HttpStatus.OK);
    }

    @GetMapping("/get-class-by-teacher-id/{teacherId}")
    public ResponseEntity<List<ClassResponse>> getClassesByTeacherId(@PathVariable(value = "teacherId") String teacherId) {
        List<ClassResponse> classResponses = classService.getClassesByTeacherId(teacherId);
        return new ResponseEntity<>(classResponses, HttpStatus.OK);
    }

    @GetMapping("/get/{classId}")
    public ResponseEntity<ClassResponse> getClassById(@PathVariable(value = "classId") String classId) {
        ClassResponse classResponse = classService.getClassById(classId);
        return new ResponseEntity<>(classResponse, HttpStatus.OK);
    }
}
