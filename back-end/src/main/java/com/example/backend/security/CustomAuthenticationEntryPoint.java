package com.example.backend.security;

import com.example.backend.dto.response.ResponseDetail;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Optional;

/*
    This component is custom exceptions for authorization or authentication
 */
@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private final AuthenticationEntryPoint delegate = new BearerTokenAuthenticationEntryPoint();
    private final ObjectMapper mapper;

    public CustomAuthenticationEntryPoint(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        this.delegate.commence(request, response, authException);
        response.setContentType("application/json;charset=UTF-8");

        ResponseDetail<Object> res = new ResponseDetail<Object>();
        res.setStatus(HttpStatus.UNAUTHORIZED.value());

        String errorMessage = Optional.ofNullable(authException.getCause()).map(Throwable::getMessage)
                .orElse(authException.getMessage());
        res.setError(errorMessage);
        switch (errorMessage) {
            case "User is disabled" -> res.setMessage("Tài khoản đã bị khoá hoặc chưa kích hoạt");
            case "User account is locked" -> res.setMessage("Tài khoản đã bị khoá");
            case "Bad credentials" -> res.setMessage("Tài khoản hoặc mật khẩu không đúng");
            default ->
                    res.setMessage("Token không hợp lệ (hết hạn, không đúng định dạng, hoặc không truyền JWT ở header)...");
        }

        mapper.writeValue(response.getWriter(), res);
    }
}