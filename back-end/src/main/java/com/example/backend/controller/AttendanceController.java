package com.example.backend.controller;

import com.example.backend.dto.attendance.AttendanceRequest;
import com.example.backend.dto.attendance.AttendanceResponse;
import com.example.backend.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
@RequiredArgsConstructor
public class AttendanceController {
    private final AttendanceService attendanceService;

    @PostMapping("/create")
    public ResponseEntity<AttendanceResponse> createAttendance(@RequestBody @Valid AttendanceRequest request) {
        AttendanceResponse response = attendanceService.createAttendance(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/bulk-upsert")
    public ResponseEntity<List<AttendanceResponse>> upsertBulkAttendance(
            @RequestBody @Valid List<AttendanceRequest> requests
    ) {
        List<AttendanceResponse> responses = attendanceService.upsertBulkAttendance(requests);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByStudent(
            @PathVariable String studentId,
            @RequestParam(required = false) String classId) {
        if (classId == null || classId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        List<AttendanceResponse> attendances = attendanceService.getAttendanceByStudent(studentId, classId);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<AttendanceResponse>> getAttendanceByClass(@PathVariable String classId) {
        List<AttendanceResponse> attendances = attendanceService.getAttendanceByClass(classId);
        return ResponseEntity.ok(attendances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse> getAttendanceById(@PathVariable String id) {
        AttendanceResponse attendance = attendanceService.getAttendanceById(id);
        return ResponseEntity.ok(attendance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable String id,
            @RequestBody @Valid AttendanceRequest request) {
        AttendanceResponse response = attendanceService.updateAttendance(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable String id) {
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/student/{studentId}/count")
    public ResponseEntity<Integer> countAttendedSessions(
            @PathVariable String studentId,
            @RequestParam(required = false) String classId) {
        if (classId == null || classId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Integer count = attendanceService.countAttendedSessions(studentId, classId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/student/{studentId}/next-session")
    public ResponseEntity<Integer> getNextSessionNumber(
            @PathVariable String studentId,
            @RequestParam(required = false) String classId) {
        if (classId == null || classId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Integer nextSession = attendanceService.getNextSessionNumber(studentId, classId);
        return ResponseEntity.ok(nextSession);
    }
}

