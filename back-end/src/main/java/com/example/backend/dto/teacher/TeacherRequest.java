package com.example.backend.dto.teacher;


import com.example.backend.enums.Genders;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherRequest {
    private String fullName;
    private String email;
    private String phoneNumber;
    private String idCard;
    private String avatar;
    private Instant dob;
    private Genders gender;
}
