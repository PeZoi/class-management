package com.example.backend.dto;

import com.nimbusds.openid.connect.sdk.claims.Gender;
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
public class UserReturnJwt {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String idCard;
    private String avatar;
    private Gender gender;
    private String role;
}
