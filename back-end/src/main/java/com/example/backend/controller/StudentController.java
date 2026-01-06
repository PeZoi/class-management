package com.example.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.student.StudentRequest;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.service.StudentService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
    private final StudentService studentService;

    @GetMapping("/get-all")
    public ResponseEntity<List<StudentResponse>> getAll() {
        List<StudentResponse> studentResponseList = studentService.getAll();
        return new ResponseEntity<>(studentResponseList, HttpStatus.OK);
    }

    @GetMapping("/get-students-by-class/{classId}")
    public ResponseEntity<List<StudentResponse>> getStudentsByClass(@PathVariable String classId) {
        List<StudentResponse> studentResponseList = studentService.getStudentsByClass(classId);
        return new ResponseEntity<>(studentResponseList, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<StudentResponse> create(@RequestBody StudentRequest studentRequest) {
        StudentResponse studentResponse = studentService.create(studentRequest);
        return new ResponseEntity<>(studentResponse, HttpStatus.CREATED);
    }

    @PutMapping("/update/{studentId}")
    public ResponseEntity<StudentResponse> update(@RequestBody StudentRequest studentRequest, @PathVariable String studentId) {
        StudentResponse studentResponse = studentService.update(studentRequest, studentId);
        return new ResponseEntity<>(studentResponse, HttpStatus.OK);
    }
}
