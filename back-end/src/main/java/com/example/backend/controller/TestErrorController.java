package com.example.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * API dùng để test hệ thống logging + Telegram.
 * KHÔNG dùng cho production thật, chỉ để kiểm tra nhanh.
 */
@RestController
@RequestMapping("/api/test")
public class TestErrorController {

    /**
     * Gọi endpoint này sẽ luôn ném RuntimeException để kích hoạt GlobalExceptionHandler.
     */
    @GetMapping("/error")
    public ResponseEntity<Map<String, Object>> triggerError() {
        throw new RuntimeException("Test Telegram error from /api/test/error");
    }
}


