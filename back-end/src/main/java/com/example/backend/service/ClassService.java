package com.example.backend.service;

import com.example.backend.dto.classroom.ClassRequest;
import com.example.backend.dto.classroom.ClassResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.User;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {
    private final ClassRepository classRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public ClassResponse create(ClassRequest classRequest) {
        User teacher = userRepository.findById(classRequest.getTeacherId()).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        Class classroom = modelMapper.map(classRequest, Class.class);
        classroom.setTeacher(teacher);

        Class classResponse = classRepository.save(classroom);

        return modelMapper.map(classResponse, ClassResponse.class);
    }

    public List<ClassResponse> getAllClasses() {
        List<ClassResponse> classResponses = new ArrayList<>();
        List<Class> classes = classRepository.findAll();

        for (Class c : classes) {
            ClassResponse classResponse = modelMapper.map(c, ClassResponse.class);
            classResponses.add(classResponse);
        }

        return classResponses;
    }

    public ClassResponse update(String classId, ClassRequest classRequest) {
        Class classDB = classRepository.findById(classId).orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));
        User TeacherDB = userRepository.findById(classRequest.getTeacherId()).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        classDB.setName(classRequest.getName());
        classDB.setSchedule(classRequest.getSchedule());
        classDB.setMonthlyFee(classRequest.getMonthlyFee());
        classDB.setTeacher(TeacherDB);
        Class classResponse = classRepository.save(classDB);
        return modelMapper.map(classResponse, ClassResponse.class);
    }
}
