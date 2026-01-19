package com.example.backend.dto.profile;

import com.example.backend.enums.Genders;
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
public class ProfileResponse {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String idCard;
    private Instant dob;
    private String avatar;
    private Genders gender;
    private Instant createdAt;
    private Instant updatedAt;
}

