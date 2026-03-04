package com.example.backend.dto.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String username;
    private String action;
    private String method;
    private String path;
    private String apiDescriptionKey;
    private String ipAddress;
    private Boolean success;
    private Integer statusCode;
    private String details;
    private Instant createdAt;
}


