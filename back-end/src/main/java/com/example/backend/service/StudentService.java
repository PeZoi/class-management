package com.example.backend.service;

import com.example.backend.dto.student.StudentRequest;
import com.example.backend.dto.student.StudentResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.Student;
import com.example.backend.entity.StudentClass;
import com.example.backend.enums.StudentClassStatus;
import com.example.backend.enums.StudentStatus;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.StudentClassRepository;
import com.example.backend.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentClassRepository studentClassRepository;
    private final ClassRepository classRepository;
    private final ModelMapper modelMapper;

    public StudentResponse create(StudentRequest studentRequest) {
        Class classDB = classRepository.findById(studentRequest.getClassId()).orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
        Student studentReq = modelMapper.map(studentRequest, Student.class);
        studentReq.setStatus(StudentStatus.ACTIVE);

        Student student = studentRepository.save(studentReq);

        StudentClass studentClass = new StudentClass();
        studentClass.setStudent(student);
        studentClass.setClazz(classDB);
        studentClass.setJoinedAt(Instant.now());
        studentClass.setStatus(StudentClassStatus.STUDYING);
        StudentClass studentClassDB = studentClassRepository.save(studentClass);

        StudentResponse studentResponse = modelMapper.map(student, StudentResponse.class);
        StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();
        studentClassResponse.setId(classDB.getId());
        studentClassResponse.setName(classDB.getName());
        studentClassResponse.setJoinAt(studentClassDB.getJoinedAt());
        return studentResponse;
    }
}
