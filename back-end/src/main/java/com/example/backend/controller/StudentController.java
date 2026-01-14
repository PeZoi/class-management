package com.example.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.student.ClassHistoryResponse;
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

    @GetMapping("/get-students-by-class-shift/{classShiftId}")
    public ResponseEntity<List<StudentResponse>> getStudentsByClassShift(@PathVariable String classShiftId) {
        List<StudentResponse> studentResponseList = studentService.getStudentsByClassShift(classShiftId);
        return new ResponseEntity<>(studentResponseList, HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable String id) {
        StudentResponse studentResponse = studentService.getStudentById(id);
        return new ResponseEntity<>(studentResponse, HttpStatus.OK);
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

    @GetMapping("/class-history/{studentId}")
    public ResponseEntity<List<ClassHistoryResponse>> getClassHistory(@PathVariable String studentId) {
        List<ClassHistoryResponse> classHistoryList = studentService.getClassHistory(studentId);
        return new ResponseEntity<>(classHistoryList, HttpStatus.OK);
    }
}
