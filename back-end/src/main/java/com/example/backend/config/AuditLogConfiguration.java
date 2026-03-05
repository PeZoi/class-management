package com.example.backend.config;

import com.example.backend.service.AuditLogService;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
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
    private final ObjectMapper objectMapper;

    /**
     * Interceptor nội bộ để ghi audit log cho các request API.
     */
    private class AuditLogInterceptor implements HandlerInterceptor {

        private final AuditLogService auditLogService;
        private final AuditApiDescriptionRegistry auditApiDescriptionRegistry;
        private final ObjectMapper objectMapper;
        /**
         * Các path cần bỏ qua không ghi audit log (dùng cho các request kỹ thuật/không liên quan nghiệp vụ).
         */
        private static final String[] IGNORED_PATHS = {
        };

        private AuditLogInterceptor(AuditLogService auditLogService,
                                    AuditApiDescriptionRegistry auditApiDescriptionRegistry,
                                    ObjectMapper objectMapper) {
            this.auditLogService = auditLogService;
            this.auditApiDescriptionRegistry = auditApiDescriptionRegistry;
            this.objectMapper = objectMapper;
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

            String ip = getClientIpAddress(request);
            int statusCode = response.getStatus();
            
            // Bỏ qua các request trả về 404 (không tồn tại API) - không log và không gửi Telegram
            if (statusCode == 404) {
                return;
            }
            
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
         * Đối với API login, sẽ loại bỏ trường password khỏi body.
         */
        private String buildDetailsJson(HttpServletRequest request, String path) {
            boolean isLoginApi = path != null && path.startsWith("/api/auth/login");

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
                if (isLoginApi) {
                    // Đối với API login, loại bỏ trường password
                    try {
                        JsonNode jsonNode = objectMapper.readTree(body);
                        if (jsonNode.isObject()) {
                            ObjectNode objectNode = (ObjectNode) jsonNode;
                            objectNode.remove("password");
                            sb.append(objectMapper.writeValueAsString(objectNode));
                        } else {
                            sb.append(body);
                        }
                    } catch (Exception e) {
                        // Nếu parse JSON thất bại, lưu nguyên văn
                        sb.append(body);
                    }
                } else {
                    // Giả sử body đã là JSON hợp lệ, lưu nguyên văn
                    sb.append(body);
                }
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
         * Lấy địa chỉ IP thực của client (browser), không phải IP của Docker container hoặc reverse proxy.
         * Kiểm tra các header proxy phổ biến theo thứ tự ưu tiên.
         */
        private String getClientIpAddress(HttpServletRequest request) {
            // 1. Kiểm tra X-Forwarded-For (header phổ biến nhất, được set bởi reverse proxy/load balancer)
            String xForwardedFor = request.getHeader("X-Forwarded-For");
            if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
                // X-Forwarded-For có thể chứa nhiều IP được phân tách bằng dấu phẩy
                // IP đầu tiên là IP thực của client
                String[] ips = xForwardedFor.split(",");
                if (ips.length > 0) {
                    String clientIp = ips[0].trim();
                    if (!clientIp.isEmpty()) {
                        return clientIp;
                    }
                }
            }

            // 2. Kiểm tra X-Real-IP (header được set bởi Nginx và một số reverse proxy khác)
            String xRealIp = request.getHeader("X-Real-IP");
            if (xRealIp != null && !xRealIp.isEmpty()) {
                return xRealIp.trim();
            }

            // 3. Kiểm tra X-Forwarded (header chuẩn RFC 7239)
            String xForwarded = request.getHeader("X-Forwarded");
            if (xForwarded != null && !xForwarded.isEmpty()) {
                // X-Forwarded có format: for=192.0.2.60;proto=http;by=203.0.113.43
                String[] parts = xForwarded.split(";");
                for (String part : parts) {
                    if (part.trim().startsWith("for=")) {
                        String ip = part.trim().substring(4).trim();
                        if (!ip.isEmpty()) {
                            // Có thể có dấu ngoặc kép hoặc IPv6 trong ngoặc vuông
                            ip = ip.replace("\"", "").replace("[", "").replace("]", "");
                            return ip;
                        }
                    }
                }
            }

            // 4. Kiểm tra Forwarded-For (header chuẩn RFC 7239, ít dùng hơn)
            String forwardedFor = request.getHeader("Forwarded-For");
            if (forwardedFor != null && !forwardedFor.isEmpty()) {
                return forwardedFor.trim();
            }

            // 5. Fallback: dùng getRemoteAddr() (có thể là IP của Docker container nếu không có proxy)
            return request.getRemoteAddr();
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
        registry.addInterceptor(new AuditLogInterceptor(auditLogService, auditApiDescriptionRegistry, objectMapper))
                .addPathPatterns("/api/**");
    }
}


