package com.example.backend.dto.classroom;

import com.example.backend.dto.teacher.TeacherResponse;
import java.util.List;
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
    private int monthlyFee;
    private int studentCount; // Số lượng học sinh trong lớp hiện tại
    private int revenue; // Doanh thu
    private int collected; // Số tiền đã nhận trong tháng này
    private int total; // Tổng số tiền phải nhận trong tháng này
    private TeacherResponse teacher;
    // Danh sách ca học của lớp (được trả thẳng về để FE không phải gọi API riêng theo từng lớp)
    private List<ClassShiftResponse> classShifts;
}
