package com.example.backend.entity;

import com.example.backend.enums.Genders;
import com.example.backend.enums.StudentStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
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
@Entity
@Table
public class Student extends Auditable{
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "full_name", length = 45, nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true, length = 30)
    private String email;

    @Column(nullable = false, unique = true, length = 30)
    private String phoneNumber;

    private Instant dob;

    @Enumerated(EnumType.STRING)
    private Genders gender;

    @Column(name = "full_name_parent", length = 45, nullable = false)
    private String fullNameParent;

    @Column(name = "phone_number_parent", nullable = false, unique = true, length = 30)
    private String phoneNumberParent;

    @Enumerated(EnumType.STRING)
    private StudentStatus status;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentClass> studentClasses = new ArrayList<>();
}
