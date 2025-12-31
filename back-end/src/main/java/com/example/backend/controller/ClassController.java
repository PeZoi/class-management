package com.example.backend.controller;

import com.example.backend.dto.classroom.ClassRequest;
import com.example.backend.dto.classroom.ClassResponse;
import com.example.backend.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/class")
@RequiredArgsConstructor
public class ClassController {
    private final ClassService classService;

    @PostMapping("/create")
    public ResponseEntity<ClassResponse> create(@RequestBody ClassRequest classRequest) {
        ClassResponse classResponse = classService.create(classRequest);
        return ResponseEntity.ok(classResponse);
    }
}
