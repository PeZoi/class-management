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
}
