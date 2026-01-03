package com.example.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.student.StudentRequest;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.service.StudentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentController {
    private StudentService studentService;

    @PostMapping("/create")
    public ResponseEntity<StudentResponse> create(@RequestBody StudentRequest studentRequest) {
        StudentResponse studentResponse = studentService.create(studentRequest);
        return new ResponseEntity<>(studentResponse, HttpStatus.CREATED);
    }
}
