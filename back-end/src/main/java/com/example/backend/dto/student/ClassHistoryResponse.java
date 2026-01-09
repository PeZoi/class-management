package com.example.backend.dto.student;

import com.example.backend.enums.StudentClassStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ClassHistoryResponse {
    private Long id;
    private String className;
    private String classId;
    private Instant joinedAt;
    private Instant leftAt;
    private StudentClassStatus status;
    private String reason; // Có thể thêm lý do chuyển lớp trong tương lai
}

