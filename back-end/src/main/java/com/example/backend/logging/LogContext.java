package com.example.backend.logging;

import lombok.Builder;
import lombok.Data;

/**
 * Thông tin ngữ cảnh đi kèm mỗi log lỗi để dễ debug.
 */
@Data
@Builder
public class LogContext {

    /**
     * HTTP method + path, ví dụ: "POST /api/class/create".
     */
    private String route;

    /**
     * ID user (nếu đã đăng nhập), có thể null.
     */
    private String userId;

    /**
     * Địa chỉ IP của client.
     */
    private String ip;

    /**
     * User-Agent của client.
     */
    private String userAgent;

    /**
     * HTTP status code của response (nếu đã biết tại thời điểm log).
     * Ví dụ: 400, 401, 500...
     */
    private Integer statusCode;

    /**
     * Payload (request body hoặc phần quan trọng của nó), đã được sanitize.
     */
    private String payload;

    /**
     * Thông tin bổ sung khác nếu cần.
     */
    private String extra;
}


