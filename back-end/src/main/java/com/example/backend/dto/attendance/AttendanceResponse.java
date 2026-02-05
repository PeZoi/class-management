package com.example.backend.dto.attendance;

import com.example.backend.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttendanceResponse {
    private String id;
    private String studentId;
    private String studentName;
    private String classId;
    private String className;
    private Instant sessionDate;
    private Integer sessionNumber;
    private AttendanceStatus status;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}

