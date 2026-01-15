package com.example.backend.controller;

import com.example.backend.dto.classroom.ClassShiftRequest;
import com.example.backend.dto.classroom.ClassShiftResponse;
import com.example.backend.service.ClassShiftService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/class-shift")
@RequiredArgsConstructor
public class ClassShiftController {

    private final ClassShiftService classShiftService;

    @PostMapping("/create")
    public ResponseEntity<ClassShiftResponse> create(@RequestBody ClassShiftRequest request) {
        ClassShiftResponse response = classShiftService.create(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ClassShiftResponse> update(@PathVariable("id") String id,
                                                     @RequestBody ClassShiftRequest request) {
        ClassShiftResponse response = classShiftService.update(id, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/by-class/{classId}")
    public ResponseEntity<List<ClassShiftResponse>> getByClass(@PathVariable("classId") String classId) {
        List<ClassShiftResponse> responses = classShiftService.getByClassId(classId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        classShiftService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}


