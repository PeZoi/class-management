package com.example.backend.controller;

import com.example.backend.dto.classroom.ClassResponse;
import com.example.backend.dto.common.PageResponse;
import com.example.backend.dto.teacher.TeacherRequest;
import com.example.backend.dto.teacher.TeacherResponse;
import com.example.backend.enums.Genders;
import com.example.backend.enums.Status;
import com.example.backend.service.ClassService;
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
    private final ClassService classService;

    /**
     * Get all teachers with pagination, search and filtering support
     * @param page Page number (0-based), default 0
     * @param size Number of items per page, default 10
     * @param search Search term for fullName, email, or phoneNumber (optional)
     * @param gender Filter by gender: MALE, FEMALE, OTHER (optional)
     * @param status Filter by status: ACTIVE, DELETED, BLOCKED (optional). If not provided, returns all statuses
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

    /**
     * Soft delete a teacher account.
     * This will set the teacher's status to DELETED and detach the teacher from related classes.
     */
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<TeacherResponse> deleteTeacher(@PathVariable String id) {
        TeacherResponse teacherResponse = teacherService.deleteTeacher(id);
        return new ResponseEntity<>(teacherResponse, HttpStatus.OK);
    }

    /**
     * Restore a soft-deleted teacher (set status back to ACTIVE)
     * @param id ID of teacher to restore
     * @return Restored teacher response
     */
    @PostMapping("/restore/{id}")
    public ResponseEntity<TeacherResponse> restoreTeacher(@PathVariable String id) {
        TeacherResponse teacherResponse = teacherService.restoreTeacher(id);
        return new ResponseEntity<>(teacherResponse, HttpStatus.OK);
    }

    /**
     * Get classes assigned to a teacher
     * @param id ID of teacher
     * @return List of classes assigned to the teacher
     */
    @GetMapping("/{id}/classes")
    public ResponseEntity<List<ClassResponse>> getTeacherClasses(@PathVariable String id) {
        List<ClassResponse> classes = classService.getClassesByTeacherId(id);
        return new ResponseEntity<>(classes, HttpStatus.OK);
    }

    /**
     * Get unassigned classes (classes without teacher)
     * @return List of unassigned classes
     */
    @GetMapping("/unassigned-classes")
    public ResponseEntity<List<ClassResponse>> getUnassignedClasses() {
        List<ClassResponse> classes = classService.getUnassignedClasses();
        return new ResponseEntity<>(classes, HttpStatus.OK);
    }

    /**
     * Assign classes to a teacher
     * @param id ID of teacher
     * @param classIds List of class IDs to assign
     * @return List of assigned classes
     */
    @PostMapping("/{id}/assign-classes")
    public ResponseEntity<List<ClassResponse>> assignClassesToTeacher(
            @PathVariable String id,
            @RequestBody List<String> classIds
    ) {
        List<ClassResponse> classes = classService.assignClassesToTeacher(id, classIds);
        return new ResponseEntity<>(classes, HttpStatus.OK);
    }
}
