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
    // DEPRECATED: Giữ lại để backward compatibility, sẽ dùng sessionPaymentStatuses thay thế
    @Builder.Default
    private List<MonthPaymentStatus> monthPaymentStatuses = new ArrayList<>();
    
    // Danh sách trạng thái thanh toán theo gói buổi học (mới)
    @Builder.Default
    private List<SessionPaymentStatusDTO> sessionPaymentStatuses = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentClassResponse {
        private String id;
        private String name;
        private int monthlyFee;
        private Instant joinAt;
        // Thông tin ca học của học sinh trong lớp (nếu có)
        private String shiftId;
        private String shiftName;
    }
}
