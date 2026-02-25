package com.example.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.common.PageResponse;
import com.example.backend.dto.student.ClassHistoryResponse;
import com.example.backend.dto.student.UpdateStudentShiftRequest;
import com.example.backend.enums.Genders;
import com.example.backend.enums.StudentStatus;
import com.example.backend.dto.student.BulkUpdateStudentShiftRequest;
import com.example.backend.dto.student.RemoveStudentsFromClassRequest;
import com.example.backend.dto.student.DeleteStudentsRequest;
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

    /**
     * Get all students with pagination, search and filtering support
     * @param page Page number (0-based), default 0
     * @param size Number of items per page, default 10
     * @param search Search term for fullName, email, or phoneNumber (optional)
     * @param gender Filter by gender: MALE, FEMALE, OTHER (optional)
     * @param status Filter by status: ACTIVE, INACTIVE, GRADUATED, DROPPED_OUT (optional)
     * @param classId Filter by class ID (optional)
     * @return PageResponse with students and pagination metadata
     */
    @GetMapping("/get-all")
    public ResponseEntity<PageResponse<StudentResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false) Genders gender,
            @RequestParam(required = false) StudentStatus status,
            @RequestParam(required = false) String classId
    ) {
        PageResponse<StudentResponse> response = studentService.getAllPaginated(
                page, size, search, gender, status, classId
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
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

    @PutMapping("/update-shift")
    public ResponseEntity<StudentResponse> updateStudentShift(@RequestBody UpdateStudentShiftRequest request) {
        StudentResponse studentResponse = studentService.updateStudentShift(request);
        return new ResponseEntity<>(studentResponse, HttpStatus.OK);
    }

    @PutMapping("/update-shifts")
    public ResponseEntity<List<StudentResponse>> updateStudentsShift(@RequestBody BulkUpdateStudentShiftRequest request) {
        List<StudentResponse> studentResponses = studentService.updateStudentsShift(request);
        return new ResponseEntity<>(studentResponses, HttpStatus.OK);
    }

    @PutMapping("/remove-from-class")
    public ResponseEntity<List<StudentResponse>> removeStudentsFromClass(@RequestBody RemoveStudentsFromClassRequest request) {
        List<StudentResponse> studentResponses = studentService.removeStudentsFromClass(request);
        return new ResponseEntity<>(studentResponses, HttpStatus.OK);
    }

    @GetMapping("/class-history/{studentId}")
    public ResponseEntity<List<ClassHistoryResponse>> getClassHistory(@PathVariable String studentId) {
        List<ClassHistoryResponse> classHistoryList = studentService.getClassHistory(studentId);
        return new ResponseEntity<>(classHistoryList, HttpStatus.OK);
    }

    /**
     * Soft delete multiple students by marking as DELETED
     * Supports both single and bulk deletion
     * Uses POST instead of DELETE to support request body across all HTTP clients
     * @param request Request containing list of student IDs
     * @return List of deleted student responses
     */
    @PostMapping("/delete")
    public ResponseEntity<List<StudentResponse>> deleteStudents(@RequestBody DeleteStudentsRequest request) {
        List<StudentResponse> studentResponses = studentService.deleteStudents(request.getStudentIds());
        return new ResponseEntity<>(studentResponses, HttpStatus.OK);
    }
}
