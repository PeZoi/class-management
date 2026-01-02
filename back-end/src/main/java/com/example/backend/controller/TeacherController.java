package com.example.backend.controller;

import com.example.backend.dto.teacher.TeacherRequest;
import com.example.backend.dto.teacher.TeacherResponse;
import com.example.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;

    @GetMapping("/get-all")
    public ResponseEntity<List<TeacherResponse>> getAllTeachers() {
        List<TeacherResponse> teachers = teacherService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<TeacherResponse> getTeacherById(@PathVariable String id) {
        TeacherResponse teacherResponse = teacherService.getTeacherById(id);
        return new ResponseEntity<>(teacherResponse, HttpStatus.OK);
    }

    @PostMapping("/create")
    public ResponseEntity<TeacherResponse> createTeacher(@RequestBody TeacherRequest teacherRequest) {
        TeacherResponse teacherResponse = teacherService.createTeacher(teacherRequest);
        return new ResponseEntity<>(teacherResponse, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public  ResponseEntity<TeacherResponse> updateTeacher(@RequestBody TeacherRequest teacherRequest, @PathVariable String id) {
        TeacherResponse teacherResponse = teacherService.updateTeacher(teacherRequest, id);
        return new ResponseEntity<>(teacherResponse, HttpStatus.OK);
    }
}
