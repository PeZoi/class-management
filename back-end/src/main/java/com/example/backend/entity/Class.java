package com.example.backend.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
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
public class Class extends Auditable {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(length = 45, nullable = false, unique = true)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "monthly_fee", nullable = false)
    private int monthlyFee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = true)
    private User teacher;

    @OneToMany(mappedBy = "clazz", cascade = CascadeType.ALL)
    private List<StudentClass> studentClasses = new ArrayList<>();

    // Danh sách các ca học của lớp (1 lớp có nhiều ca)
    @OneToMany(mappedBy = "clazz", cascade = CascadeType.ALL)
    private List<ClassShift> classShifts = new ArrayList<>();

    // ===== SOFT DELETE FIELDS =====
    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Column(name = "deleted_by")
    private String deletedBy;
}
