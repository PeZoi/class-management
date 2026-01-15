package com.example.backend.service;

import com.example.backend.dto.classroom.ClassShiftRequest;
import com.example.backend.dto.classroom.ClassShiftResponse;
import com.example.backend.entity.Class;
import com.example.backend.entity.ClassShift;
import com.example.backend.entity.StudentClass;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.ClassRepository;
import com.example.backend.repository.ClassShiftRepository;
import com.example.backend.repository.StudentClassRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassShiftService {
    private final ClassShiftRepository classShiftRepository;
    private final ClassRepository classRepository;
    private final StudentClassRepository studentClassRepository;
    private final ModelMapper modelMapper;

    @Transactional
    public ClassShiftResponse create(ClassShiftRequest request) {
        Class clazz = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        ClassShift shift = new ClassShift();
        shift.setName(request.getName());
        shift.setClazz(clazz);

        ClassShift saved = classShiftRepository.save(shift);
        return toResponse(saved);
    }

    @Transactional
    public ClassShiftResponse update(String id, ClassShiftRequest request) {
        ClassShift shift = classShiftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ca học"));

        if (request.getName() != null) {
            shift.setName(request.getName());
        }

        ClassShift saved = classShiftRepository.save(shift);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClassShiftResponse> getByClassId(String classId) {
        Class clazz = classRepository.findById(classId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy lớp học"));

        return classShiftRepository.findAllByClazz(clazz)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Xóa một ca học khỏi lớp.
     * Tất cả học sinh đang gắn với ca học này sẽ được set classShift = null (tức là chưa có ca học).
     */
    @Transactional
    public void delete(String id) {
        ClassShift shift = classShiftRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy ca học"));

        // Bỏ liên kết ca học cho tất cả học sinh đang thuộc ca này
        List<StudentClass> studentClasses = studentClassRepository.findByClassShift_Id(id);
        for (StudentClass sc : studentClasses) {
            sc.setClassShift(null);
        }
        if (!studentClasses.isEmpty()) {
            studentClassRepository.saveAll(studentClasses);
        }

        classShiftRepository.delete(shift);
    }

    private ClassShiftResponse toResponse(ClassShift shift) {
        ClassShiftResponse response = modelMapper.map(shift, ClassShiftResponse.class);
        response.setClassId(shift.getClazz().getId());
        response.setClassName(shift.getClazz().getName());
        return response;
    }
}


