package com.example.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.io.IOException;

/**
 * Filter dùng để cache body của request, phục vụ cho việc ghi audit log (payload JSON).
 */
@Component
public class AuditLogRequestBodyFilter extends OncePerRequestFilter {

    /**
     * Giới hạn dung lượng body cache để tránh phình RAM.
     * Có thể chỉnh tuỳ nhu cầu (đơn vị: bytes).
     */
    private static final int CACHE_LIMIT_BYTES = 1024 * 1024; // 1MB

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Chỉ wrap các request API (chuẩn hoá path để không lệch do context-path / trailing slash)
        String path = normalizePath(request);
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request, CACHE_LIMIT_BYTES);

        // Tiếp tục filter chain; Interceptor sẽ đọc lại body từ wrappedRequest (nếu controller đã đọc body).
        filterChain.doFilter(wrappedRequest, response);
    }

    private String normalizePath(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String uri = request.getRequestURI();
        if (uri == null) {
            uri = "";
        }
        String ctx = request.getContextPath();
        if (ctx != null && !ctx.isBlank() && uri.startsWith(ctx)) {
            uri = uri.substring(ctx.length());
        }
        if (uri.length() > 1 && uri.endsWith("/")) {
            uri = uri.substring(0, uri.length() - 1);
        }
        return uri;
    }
}


