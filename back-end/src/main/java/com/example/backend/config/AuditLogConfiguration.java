package com.example.backend.config;

import com.example.backend.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.util.ContentCachingRequestWrapper;

import java.nio.charset.StandardCharsets;

@Configuration
@RequiredArgsConstructor
public class AuditLogConfiguration implements WebMvcConfigurer {

    private final AuditLogService auditLogService;
    private final AuditApiDescriptionRegistry auditApiDescriptionRegistry;

    /**
     * Interceptor nội bộ để ghi audit log cho các request API.
     */
    private static class AuditLogInterceptor implements HandlerInterceptor {

        private final AuditLogService auditLogService;
        private final AuditApiDescriptionRegistry auditApiDescriptionRegistry;
        /**
         * Các path cần bỏ qua không ghi audit log (dùng cho các request kỹ thuật/không liên quan nghiệp vụ).
         */
        private static final String[] IGNORED_PATHS = {
                "/api/check_hwid"
        };

        private AuditLogInterceptor(AuditLogService auditLogService,
                                    AuditApiDescriptionRegistry auditApiDescriptionRegistry) {
            this.auditLogService = auditLogService;
            this.auditApiDescriptionRegistry = auditApiDescriptionRegistry;
        }

        @Override
        public void afterCompletion(HttpServletRequest request,
                                    HttpServletResponse response,
                                    Object handler,
                                    Exception ex) {
            String path = normalizePath(request);

            // Bỏ qua các path nằm trong danh sách ignore
            for (String ignoredPath : IGNORED_PATHS) {
                if (ignoredPath.equalsIgnoreCase(path) || path.toLowerCase().startsWith((ignoredPath + "/").toLowerCase())) {
                    return;
                }
            }

            // Chỉ log các API
            if (!path.startsWith("/api/")) {
                return;
            }

            String method = request.getMethod();

            // Chỉ log các API quan trọng: POST/PUT/PATCH/DELETE + login
            boolean isWriteMethod = "POST".equalsIgnoreCase(method)
                    || "PUT".equalsIgnoreCase(method)
                    || "PATCH".equalsIgnoreCase(method)
                    || "DELETE".equalsIgnoreCase(method);
            boolean isLoginApi = path.startsWith("/api/auth/login");

            if (!isWriteMethod && !isLoginApi) {
                return; // bỏ qua GET và các method khác không quan trọng
            }

            String ip = request.getRemoteAddr();
            int statusCode = response.getStatus();
            boolean success = (ex == null) && statusCode < 400;
            String action = method + " " + path;

            AuditApiDescriptionRegistry.ApiDescriptionDefinition apiDef = resolveApiDescriptionDefinition(method, path);
            String details = buildDetailsJson(request, path);

            auditLogService.log(
                    action,
                    method,
                    path,
                    ip,
                    success,
                    statusCode,
                    apiDef.key(),
                    details
            );
        }

        private AuditApiDescriptionRegistry.ApiDescriptionDefinition resolveApiDescriptionDefinition(String method, String path) {
            return auditApiDescriptionRegistry
                    .resolve(method, path)
                    .orElseGet(() -> new AuditApiDescriptionRegistry.ApiDescriptionDefinition(
                            method + " " + path,
                            method + " " + path
                    ));
        }

        /**
         * Xây dựng chuỗi JSON đơn giản chứa payload (body + query params).
         * Lưu dưới dạng String trong trường details.
         */
        private String buildDetailsJson(HttpServletRequest request, String path) {
            // Không ghi body cho API đăng nhập để tránh lộ password
            if (path != null && path.startsWith("/api/auth/login")) {
                return null;
            }

            StringBuilder sb = new StringBuilder();
            sb.append("{");

            // Query params
            sb.append("\"queryParams\":{");
            var paramNames = request.getParameterMap().keySet().iterator();
            boolean first = true;
            while (paramNames.hasNext()) {
                String name = paramNames.next();
                String[] values = request.getParameterValues(name);
                if (!first) sb.append(",");
                first = false;
                sb.append("\"").append(escapeJson(name)).append("\":");
                if (values != null && values.length == 1) {
                    sb.append("\"").append(escapeJson(values[0])).append("\"");
                } else {
                    sb.append("[");
                    if (values != null) {
                        for (int i = 0; i < values.length; i++) {
                            if (i > 0) sb.append(",");
                            sb.append("\"").append(escapeJson(values[i])).append("\"");
                        }
                    }
                    sb.append("]");
                }
            }
            sb.append("},");

            // Body (JSON string đã được cache trong filter)
            String body = null;
            if (request instanceof ContentCachingRequestWrapper wrapper) {
                byte[] buf = wrapper.getContentAsByteArray();
                if (buf != null && buf.length > 0) {
                    body = new String(buf, StandardCharsets.UTF_8);
                }
            }
            sb.append("\"body\":");
            if (body != null && !body.isBlank()) {
                // Giả sử body đã là JSON hợp lệ, lưu nguyên văn
                sb.append(body);
            } else {
                sb.append("null");
            }

            sb.append("}");
            return sb.toString();
        }

        private String escapeJson(String value) {
            if (value == null) return "";
            return value.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
        }

        /**
         * Chuẩn hoá path để so khớp ổn định giữa các môi trường:
         * - bỏ context path (nếu có)
         * - bỏ trailing slash (trừ root "/")
         */
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

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new AuditLogInterceptor(auditLogService, auditApiDescriptionRegistry))
                .addPathPatterns("/api/**");
    }
}


