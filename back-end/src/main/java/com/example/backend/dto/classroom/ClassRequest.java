package com.example.backend.dto.classroom;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class ClassRequest {
    private String id;
    private String name;
    private String description;
    private int monthlyFee;
    private String teacherId;
}
