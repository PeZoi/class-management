package com.example.backend.service;

import com.example.backend.dto.teacher.TeacherRequest;
import com.example.backend.dto.teacher.TeacherResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.Status;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class TeacherService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ClassRepository classRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public List<TeacherResponse> getAllTeachers() {
        List<TeacherResponse> teachers = new ArrayList<>();
        List<User> users = userRepository.findAll().stream().filter((user -> Objects.equals(user.getRole().getName(), "ROLE_TEACHER"))).toList();

        for (User user : users) {
            List<Class> classList = classRepository.findAllByTeacher(user);
            List<TeacherResponse.TeacherClass> teacherClassList =
                    classList.stream()
                            .map(clazz -> modelMapper.map(clazz, TeacherResponse.TeacherClass.class))
                            .toList();

            TeacherResponse teacher = modelMapper.map(user, TeacherResponse.class);
            teacher.setClassList(teacherClassList);
            teachers.add(teacher);
        }

        return teachers;
    }

    public TeacherResponse getTeacherById(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        List<Class> classList = classRepository.findAllByTeacher(user);
        List<TeacherResponse.TeacherClass> teacherClassList =
                classList.stream()
                        .map(clazz -> modelMapper.map(clazz, TeacherResponse.TeacherClass.class))
                        .toList();
        TeacherResponse teacherResponse = modelMapper.map(user, TeacherResponse.class);
        teacherResponse.setClassList(teacherClassList);
        return teacherResponse;
    }

    public TeacherResponse createTeacher(TeacherRequest teacherRequest) {
        User teacher = modelMapper.map(teacherRequest, User.class);
        Role role = roleRepository.findByName("ROLE_TEACHER");

        teacher.setId(null);
        teacher.setUsername(teacherRequest.getPhoneNumber());
        teacher.setPassword(passwordEncoder.encode(teacherRequest.getPhoneNumber()));
        teacher.setRole(role);
        teacher.setStatus(Status.ACTIVE);
        teacher.setEnabled(true);

        User teacherRes = userRepository.save(teacher);
        return modelMapper.map(teacherRes, TeacherResponse.class);
    }

    public  TeacherResponse updateTeacher(TeacherRequest teacherRequest, String teacherId) {
        User teacher = userRepository.findById(teacherId).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        teacher.setFullName(teacherRequest.getFullName());
        teacher.setEmail(teacherRequest.getEmail());
        teacher.setPhoneNumber(teacherRequest.getPhoneNumber());
        teacher.setIdCard(teacherRequest.getIdCard());
        teacher.setDob(teacherRequest.getDob());
        teacher.setGender(teacherRequest.getGender());

        User teacherRes = userRepository.save(teacher);
        return modelMapper.map(teacherRes, TeacherResponse.class);
    }

    public TeacherResponse resetPassword(String teacherId) {
        User teacher = userRepository.findById(teacherId).orElseThrow(() -> new NotFoundException("Không tìm thấy giáo viên"));
        // Reset password to username (which is the phoneNumber)
        teacher.setPassword(passwordEncoder.encode(teacher.getUsername()));
        User teacherRes = userRepository.save(teacher);
        return modelMapper.map(teacherRes, TeacherResponse.class);
    }
}
