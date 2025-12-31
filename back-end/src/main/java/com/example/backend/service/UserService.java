package com.example.backend.service;

import com.example.backend.dto.teacher.TeacherResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public List<TeacherResponse> getAllTeachers() {
        List<TeacherResponse> teachers = new ArrayList<>();
        List<User> users = userRepository.findAll().stream().filter((user -> Objects.equals(user.getRole().getName(), "ROLE_TEACHER"))).toList();

        for (User user : users) {
            TeacherResponse teacher = modelMapper.map(user, TeacherResponse.class);
            teachers.add(teacher);
        }

        return teachers;
    }
}
