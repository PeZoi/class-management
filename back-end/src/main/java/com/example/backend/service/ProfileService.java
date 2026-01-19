package com.example.backend.service;

import com.example.backend.dto.profile.ProfileRequest;
import com.example.backend.dto.profile.ProfileResponse;
import com.example.backend.entity.User;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.NotFoundException;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final PasswordEncoder passwordEncoder;

    public ProfileResponse getCurrentUserProfile() {
        String username = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin người dùng"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
        
        return modelMapper.map(user, ProfileResponse.class);
    }

    public ProfileResponse updateCurrentUserProfile(ProfileRequest profileRequest) {
        String username = SecurityUtil.getCurrentUserLogin()
                .orElseThrow(() -> new NotFoundException("Không tìm thấy thông tin người dùng"));
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy người dùng"));
        
        // Kiểm tra trùng email (trừ chính user hiện tại)
        if (!user.getEmail().equals(profileRequest.getEmail()) && 
            userRepository.existsByEmailAndIdNot(profileRequest.getEmail(), user.getId())) {
            throw new CustomException("Email đã được sử dụng bởi người dùng khác", HttpStatus.BAD_REQUEST);
        }
        
        // Kiểm tra trùng số điện thoại (trừ chính user hiện tại)
        if (!user.getPhoneNumber().equals(profileRequest.getPhoneNumber()) && 
            userRepository.existsByPhoneNumberAndIdNot(profileRequest.getPhoneNumber(), user.getId())) {
            throw new CustomException("Số điện thoại đã được sử dụng bởi người dùng khác", HttpStatus.BAD_REQUEST);
        }
        
        // Kiểm tra trùng căn cước công dân (trừ chính user hiện tại)
        if (!user.getIdCard().equals(profileRequest.getIdCard()) && 
            userRepository.existsByIdCardAndIdNot(profileRequest.getIdCard(), user.getId())) {
            throw new CustomException("Căn cước công dân đã được sử dụng bởi người dùng khác", HttpStatus.BAD_REQUEST);
        }
        
        // Cập nhật thông tin cơ bản
        user.setFullName(profileRequest.getFullName());
        user.setEmail(profileRequest.getEmail());
        user.setPhoneNumber(profileRequest.getPhoneNumber());
        user.setUsername(profileRequest.getPhoneNumber());
        user.setIdCard(profileRequest.getIdCard());
        user.setDob(profileRequest.getDob());
        user.setGender(profileRequest.getGender());
        
        // Cập nhật mật khẩu nếu có
        if (profileRequest.getPassword() != null && !profileRequest.getPassword().isEmpty()) {
            // Kiểm tra mật khẩu hiện tại nếu có yêu cầu đổi mật khẩu
            if (profileRequest.getCurrentPassword() == null || profileRequest.getCurrentPassword().isEmpty()) {
                throw new CustomException("Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu", HttpStatus.BAD_REQUEST);
            }
            
            // Xác thực mật khẩu hiện tại
            if (!passwordEncoder.matches(profileRequest.getCurrentPassword(), user.getPassword())) {
                throw new CustomException("Mật khẩu hiện tại không đúng", HttpStatus.BAD_REQUEST);
            }
            
            // Cập nhật mật khẩu mới
            user.setPassword(passwordEncoder.encode(profileRequest.getPassword()));
        }
        
        User updatedUser = userRepository.save(user);
        return modelMapper.map(updatedUser, ProfileResponse.class);
    }
}

