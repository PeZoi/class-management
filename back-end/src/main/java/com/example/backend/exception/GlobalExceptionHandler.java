package com.example.backend.exception;

import com.example.backend.logging.LogContext;
import com.example.backend.logging.LoggerService;
import com.example.backend.security.SecurityUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

/**
 * Bắt tất cả exception chưa xử lý trong hệ thống và log lại tập trung.
 */
@RestControllerAdvice
@Order(Ordered.HIGHEST_PRECEDENCE)
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    private final LoggerService loggerService;

    /**
     * Xử lý lỗi validate @Valid, trả 400.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(MethodArgumentNotValidException ex,
                                                                      HttpServletRequest request) {
        LogContext ctx = buildContext(request);
        ctx.setStatusCode(HttpStatus.BAD_REQUEST.value());

        loggerService.warn(ctx, "Validation failed: " + ex.getMessage());

        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .code("VALIDATION_ERROR")
                .message("Dữ liệu không hợp lệ, vui lòng kiểm tra lại.")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    /**
     * Xử lý lỗi khi endpoint không tồn tại (404).
     */
    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoResourceFoundException(org.springframework.web.servlet.resource.NoResourceFoundException ex,
                                                                          HttpServletRequest request) {
        // Không log và không gửi Telegram cho 404 errors
        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .code("NOT_FOUND")
                .message("API không tồn tại")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    /**
     * Xử lý lỗi authentication (đăng nhập sai, tài khoản bị khoá, v.v.).
     * Ví dụ: BadCredentialsException, UsernameNotFoundException.
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthenticationException(AuthenticationException ex,
                                                                          HttpServletRequest request) {
        LogContext ctx = buildContext(request);
        ctx.setStatusCode(HttpStatus.UNAUTHORIZED.value());

        // Lỗi đăng nhập sai hoặc user không tồn tại => không log ERROR/CRITICAL, chỉ warn để tránh spam
        if (ex instanceof BadCredentialsException || ex instanceof UsernameNotFoundException) {
            loggerService.warn(ctx, ex.getMessage());
        } else {
            // Các lỗi authentication bất thường khác vẫn log error để theo dõi
            loggerService.error(ctx, ex);
        }

        String message;
        if (ex instanceof BadCredentialsException || ex instanceof UsernameNotFoundException) {
            message = "Tài khoản hoặc mật khẩu không đúng.";
        } else {
            message = "Không thể xác thực người dùng, vui lòng thử lại.";
        }

        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .code("AUTHENTICATION_FAILED")
                .message(message)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(body);
    }

    /**
     * Xử lý các lỗi nghiệp vụ do mình chủ động ném ra (CustomException).
     * - Nếu là lỗi 4xx (BAD_REQUEST, FORBIDDEN, ...) thì chỉ log WARN, không gửi Telegram.
     * - Nếu là lỗi 5xx (nếu bạn dùng CustomException cho 5xx) thì log ERROR và gửi Telegram.
     */
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiErrorResponse> handleCustomException(CustomException ex,
                                                                  HttpServletRequest request) {
        HttpStatus status = ex.getHttpStatus() != null ? ex.getHttpStatus() : HttpStatus.BAD_REQUEST;

        LogContext ctx = buildContext(request);
        ctx.setStatusCode(status.value());

        if (status.is4xxClientError()) {
            // Lỗi do input/nghiệp vụ phía client => chỉ warn, không gửi Telegram
            loggerService.warn(ctx, ex.getMessage());
        } else {
            // Nếu sau này dùng CustomException cho 5xx thì vẫn log error + Telegram
            loggerService.error(ctx, ex);
        }

        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .code("BUSINESS_ERROR")
                .message(ex.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(status).body(body);
    }

    /**
     * Fallback cho mọi exception khác: trả 500 và log ERROR.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(Exception ex,
                                                                      HttpServletRequest request) {
        LogContext ctx = buildContext(request);
        ctx.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());

        loggerService.error(ctx, ex);

        ApiErrorResponse body = ApiErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .code("INTERNAL_SERVER_ERROR")
                .message("Hệ thống đang gặp lỗi, vui lòng thử lại sau.")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }

    /**
     * Xây LogContext: route + userId (username hiện tại) + IP + userAgent + payload body (nếu có).
     */
    private LogContext buildContext(HttpServletRequest request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String route = method + " " + uri;

        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        // Lấy userId/username hiện tại từ SecurityContext qua SecurityUtil
        String userId = SecurityUtil.getCurrentUserLogin().orElse(null);

        // Lấy body đã được cache bởi AuditLogRequestBodyFilter (nếu request là ContentCachingRequestWrapper)
        String payload = null;
        if (request instanceof ContentCachingRequestWrapper wrapper) {
            byte[] buf = wrapper.getContentAsByteArray();
            if (buf != null && buf.length > 0) {
                payload = new String(buf, StandardCharsets.UTF_8);
                // Có thể thêm bước sanitize ở đây nếu cần ẩn password/token
            }
        }

        return LogContext.builder()
                .route(route)
                .userId(userId)
                .ip(ip)
                .userAgent(userAgent)
                .payload(payload)
                .extra(null)
                .build();
    }
}


