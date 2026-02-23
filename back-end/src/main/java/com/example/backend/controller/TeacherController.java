package com.example.backend.controller;

import com.example.backend.dto.common.PageResponse;
import com.example.backend.dto.teacher.TeacherRequest;
import com.example.backend.dto.teacher.TeacherResponse;
import com.example.backend.enums.Genders;
import com.example.backend.enums.Status;
import com.example.backend.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {
    private final TeacherService teacherService;

    /**
     * Get all teachers with pagination, search and filtering support
     * @param page Page number (0-based), default 0
     * @param size Number of items per page, default 10
     * @param search Search term for fullName, email, or phoneNumber (optional)
     * @param gender Filter by gender: MALE, FEMALE, OTHER (optional)
     * @param status Filter by status: ACTIVE, INACTIVE (optional)
     * @return PageResponse with teachers and pagination metadata
     */
    @GetMapping("/get-all")
    public ResponseEntity<PageResponse<TeacherResponse>> getAllTeachers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false) Genders gender,
            @RequestParam(required = false) Status status
    ) {
        PageResponse<TeacherResponse> response = teacherService.getAllPaginated(
                page, size, search, gender, status
        );
        return ResponseEntity.ok(response);
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

    @PutMapping("/reset-password/{id}")
    public ResponseEntity<TeacherResponse> resetPassword(@PathVariable String id) {
        TeacherResponse teacherResponse = teacherService.resetPassword(id);
        return new ResponseEntity<>(teacherResponse, HttpStatus.OK);
    }
}
