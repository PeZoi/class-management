package com.example.backend.dto.student;

import com.example.backend.enums.Genders;
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
@ToString
public class StudentRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private Instant dob;
    private Genders gender;

    private String fullNameParent;
    private String phoneNumberParent;

    private String classId;
}
