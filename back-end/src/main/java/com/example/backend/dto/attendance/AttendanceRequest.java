package com.example.backend.dto.attendance;

import com.example.backend.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
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
public class AttendanceRequest {
    @NotNull(message = "Student ID không được để trống")
    private String studentId;

    @NotNull(message = "Class ID không được để trống")
    private String classId;

    @NotNull(message = "Ngày buổi học không được để trống")
    private Instant sessionDate;

    @NotNull(message = "Trạng thái điểm danh không được để trống")
    private AttendanceStatus status;

    private String notes; // Optional
}

