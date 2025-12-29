package com.example.backend.security;

import com.example.backend.entity.User;
import com.example.backend.enums.Status;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component("userDetailsService")
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tìm user qua username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User không tồn tại"));

        // Kiểm tra trạng thái user
        if (user.getStatus() == Status.DELETED) {
            throw new UsernameNotFoundException("User đã bị xóa");
        }

        // Lấy ra role
        Set<GrantedAuthority> authorities = Set.of(new SimpleGrantedAuthority(user.getRole().getName()));

        // Kiểm tra xem tài khoản có bị block không
        boolean isAccountNonLocked = user.getStatus() != Status.BLOCKED;

        // Trả về 1 UserDetail mặc định của spring security
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isEnabled(),
                true, // accountNonExpired
                true, // credentialsNonExpired
                isAccountNonLocked,
                authorities
        );
    }
}
