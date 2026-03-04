package com.example.backend.exception;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Response lỗi chuẩn hoá trả về cho client.
 */
@Data
@Builder
public class ApiErrorResponse {

    private LocalDateTime timestamp;

    /**
     * HTTP status code (vd: 500, 400,...).
     */
    private int status;

    /**
     * Mã lỗi ngắn gọn để FE có thể xử lý nếu cần.
     */
    private String code;

    /**
     * Thông điệp thân thiện cho client (không phải stacktrace).
     */
    private String message;

    /**
     * Đường dẫn request gây ra lỗi.
     */
    private String path;
}


