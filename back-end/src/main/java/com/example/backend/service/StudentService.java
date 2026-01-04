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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentService {
    private final StudentRepository studentRepository;
    private final StudentClassRepository studentClassRepository;
    private final ClassRepository classRepository;
    private final ModelMapper modelMapper;

    public StudentClass getClassByStudent(String studentId) {
        return studentClassRepository.findCurrentClassByStudent(studentId, StudentClassStatus.STUDYING);
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getAll() {
        List<StudentResponse> studentResponseList = new ArrayList<>();
        List<Student> studentList = studentRepository.findAll();

        for (Student s : studentList) {
            StudentResponse studentResponse = modelMapper.map(s, StudentResponse.class);
            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();

            StudentClass studentClass = getClassByStudent(studentResponse.getId());
            Class classDB = studentClass.getClazz();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClass.getJoinedAt());

            studentResponse.setClazz(studentClassResponse);

            studentResponseList.add(studentResponse);
        }
        return studentResponseList;
    }

    @Transactional(readOnly = true)
    public List<StudentResponse> getStudentsByClass(String classId) {
        List<StudentResponse> studentResponseList = new ArrayList<>();
        Class _classDB = classRepository.findById(classId).orElseThrow(() -> new NotFoundException("Không tìm thấy " +
                "lớp" +
                " học"));
        List<Student> studentList = studentClassRepository.findStudentsByClass(classId, StudentClassStatus.STUDYING, StudentStatus.ACTIVE);


        for (Student s : studentList) {
            StudentResponse studentResponse = modelMapper.map(s, StudentResponse.class);
            StudentResponse.StudentClassResponse studentClassResponse = new StudentResponse.StudentClassResponse();

            StudentClass studentClass = getClassByStudent(studentResponse.getId());
            Class classDB = studentClass.getClazz();
            studentClassResponse.setId(classDB.getId());
            studentClassResponse.setName(classDB.getName());
            studentClassResponse.setJoinAt(studentClass.getJoinedAt());

            studentResponse.setClazz(studentClassResponse);

            studentResponseList.add(studentResponse);
        }
        return studentResponseList;
    }

    public StudentResponse create(StudentRequest studentRequest) {
        Class classDB = classRepository.findById(studentRequest.getClassId()).orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
        Student studentReq = modelMapper.map(studentRequest, Student.class);
        studentReq.setId(null);
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
