package com.example.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateStudentShiftRequest {
    private String studentId;
    private String classId;
    /**
     * Optional. If null/blank => remove shift.
     */
    private String classShiftId;
}


