package com.example.backend.security;

//import com.example.vocab_vault_be.utils.enums.Status;
//import com.example.vocab_vault_be.service.UserService;
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Component;
//
//import java.util.Set;
//
//@Component("userDetailsService") // cách làm nâng cao ghi đè
//public class CustomUserDetailsService implements UserDetailsService {
//    private final UserService userService;
//
//    public CustomUserDetailsService(UserService userService) {
//        this.userService = userService;
//    }
//
//    @Override
//    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
//        // Tìm user qua email
//        com.example.vocab_vault_be.entity.User user = userService.getUserByEmail(email);
//
//        // Nếu không tim thấy user
//        if (user == null || (user.getStatus() != Status.ACTIVE && user.getStatus().equals(Status.DELETED))) {
//            throw new UsernameNotFoundException("User không tồn tại");
//        }
//
//        // Khi tìm được rồi thì lấy ra role
//        Set<GrantedAuthority> authorities = Set.of(new SimpleGrantedAuthority(user.getRole().getName()));
//
//        // Kiểm tra xem tài khoản có bị block không
//        boolean isBlocked = user.getStatus() != Status.ACTIVE && user.getStatus().equals(Status.BLOCKED);
//
//        // Trả về 1 UserDetail mặc định của spring security
//        return new User(user.getEmail(), user.getPassword(), user.isEnabled(), true, true,
//                !isBlocked,
//                authorities);
//    }
//}