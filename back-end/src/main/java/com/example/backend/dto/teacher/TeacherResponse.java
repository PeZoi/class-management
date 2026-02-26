package com.example.backend.dto.teacher;

import com.example.backend.enums.Genders;
import com.example.backend.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherResponse {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String idCard;
    private Instant dob;
    private String avatar;
    private Genders gender;
    private Status status;
    private Instant createdAt;
    private Instant updatedAt;

    private List<TeacherClass> classList;

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TeacherClass {
        private String id;
        private String name;
        private String schedule;
    }
}
