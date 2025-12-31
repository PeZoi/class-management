package com.example.backend.dto.classroom;

import com.example.backend.dto.teacher.TeacherResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassResponse {
    private String id;
    private String name;
    private String schedule;
    private int monthlyFee;
    private TeacherResponse teacher;
}
