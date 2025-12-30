package com.example.backend.service;

import com.example.backend.dto.UserReturnJwt;
import com.example.backend.dto.auth.LoginRequest;
import com.example.backend.dto.auth.LoginResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final ModelMapper modelMapper;
    private final SecurityUtil securityUtil;

    public LoginResponse login(LoginRequest loginRequest) {
        // Nạp input gồm username/password vào Security
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(), loginRequest.getPassword());
        // Xác thực người dùng => cần viết hàm loadUserByUsername
        Authentication authentication = authenticationManager.authenticate(authenticationToken);

        // Lưu người dùng vừa đăng nhập vào context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Lấy ra thông tin cơ bản của user
        User user = userRepository.findByUsername(loginRequest.getUsername()).get();
        UserReturnJwt userReturnJwt = modelMapper.map(user, UserReturnJwt.class);
        userReturnJwt.setRole(user.getRole().getName());

        // Tạo access token
        String accessToken = securityUtil.createAccessToken(authentication.getName(), userReturnJwt);

        return new LoginResponse(accessToken, userReturnJwt);
    }
}
