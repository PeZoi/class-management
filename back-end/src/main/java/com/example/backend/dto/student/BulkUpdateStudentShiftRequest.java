package com.example.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class BulkUpdateStudentShiftRequest {
    private List<String> studentIds;
    private String classId;
    /**
     * Optional. If null/blank => remove shift.
     */
    private String classShiftId;
}


