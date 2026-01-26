package com.example.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hello")
@RequiredArgsConstructor
public class HelloController {

    @Value("${spring.datasource.url}")
    private String url;

    @GetMapping
    public String hello() {
        return "hello" + url;
    }
}
