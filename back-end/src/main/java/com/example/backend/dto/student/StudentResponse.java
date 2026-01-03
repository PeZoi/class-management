package com.example.backend.dto.student;

import com.example.backend.dto.classroom.ClassResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nimbusds.openid.connect.sdk.claims.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentResponse {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Instant dob;
    private Gender gender;

    private String fullNameParent;
    private String phoneNumberParent;

    @JsonProperty(namespace = "class")
    private StudentClassResponse clazz;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentClassResponse {
        private String id;
        private String name;
        private Instant joinAt;
    }
}
