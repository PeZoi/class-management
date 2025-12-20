package com.example.backend;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @Value("${spring.datasource.url}")
    private String url;

    @GetMapping("/hello")
    public String hello() {
        return "hello" + url;
    }
}
