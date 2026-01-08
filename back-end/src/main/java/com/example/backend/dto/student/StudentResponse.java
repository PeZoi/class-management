package com.example.backend.dto.student;

import com.example.backend.enums.Genders;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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
    private Genders gender;

    private String fullNameParent;
    private String phoneNumberParent;

    @JsonProperty("class")
    private StudentClassResponse clazz;
    
    // Danh sách trạng thái thanh toán của tất cả các tháng từ joinAt đến hiện tại
    @Builder.Default
    private List<MonthPaymentStatus> monthPaymentStatuses = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentClassResponse {
        private String id;
        private String name;
        private int monthlyFee;
        private Instant joinAt;
    }
}
