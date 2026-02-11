package com.example.backend.controller;

import com.example.backend.dto.classroom.ClassRequest;
import com.example.backend.dto.classroom.ClassResponse;
import com.example.backend.dto.classroom.ClassRevenueDataResponse;
import com.example.backend.dto.classroom.ClassSingleRevenueDataResponse;
import com.example.backend.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/get-my-classes")
    public ResponseEntity<List<ClassResponse>> getMyClasses() {
        List<ClassResponse> classResponses = classService.getClassesByCurrentTeacher();
        return new ResponseEntity<>(classResponses, HttpStatus.OK);
    }

    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ClassResponse> create(@RequestBody ClassRequest classRequest) {
        ClassResponse classResponse = classService.create(classRequest);
        return new ResponseEntity<>(classResponse, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
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
        ClassResponse classResponse = classService.getClassById(classId, true);
        return new ResponseEntity<>(classResponse, HttpStatus.OK);
    }

    @GetMapping("/revenue-data/{period}")
    public ResponseEntity<List<ClassRevenueDataResponse>> getRevenueDataByPeriod(@PathVariable(value = "period") String period) {
        List<ClassRevenueDataResponse> revenueData = classService.getRevenueDataByPeriod(period);
        return new ResponseEntity<>(revenueData, HttpStatus.OK);
    }

    @GetMapping("/{classId}/revenue-data/{period}")
    public ResponseEntity<List<ClassSingleRevenueDataResponse>> getRevenueDataByClassIdAndPeriod(
            @PathVariable(value = "classId") String classId,
            @PathVariable(value = "period") String period) {
        List<ClassSingleRevenueDataResponse> revenueData = classService.getRevenueDataByClassIdAndPeriod(classId, period);
        return new ResponseEntity<>(revenueData, HttpStatus.OK);
    }

    @GetMapping("/top-3-revenue")
    public ResponseEntity<List<ClassResponse>> getTop3ClassesByRevenue() {
        List<ClassResponse> topClasses = classService.getTop3ClassesByRevenue();
        return new ResponseEntity<>(topClasses, HttpStatus.OK);
    }
}
