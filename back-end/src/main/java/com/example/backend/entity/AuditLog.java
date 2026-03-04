package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tên đăng nhập của user thực hiện hành động.
     */
    @Column(name = "username", length = 100)
    private String username;

    /**
     * Mô tả hành động (ví dụ: GET /api/students, CREATE_CLASS, DELETE_PAYMENT,...).
     */
    @Column(name = "action", length = 255)
    private String action;

    /**
     * HTTP method: GET/POST/PUT/DELETE/PATCH...
     */
    @Column(name = "method", length = 20)
    private String method;

    /**
     * Key mô tả API để FE translate (ví dụ: AUTH_LOGIN, STUDENT_CREATE,...).
     */
    @Column(name = "api_description_key", length = 100)
    private String apiDescriptionKey;

    /**
     * Đường dẫn request.
     */
    @Column(name = "path", length = 500)
    private String path;

    /**
     * Địa chỉ IP client.
     */
    @Column(name = "ip_address", length = 100)
    private String ipAddress;

    /**
     * Trạng thái thành công/thất bại của request.
     */
    @Column(name = "success")
    private Boolean success;

    /**
     * Thông tin chi tiết (nếu cần) – có thể là JSON param/body, hoặc message ngắn.
     */
    @Lob
    @Column(name = "details", columnDefinition = "LONGTEXT")
    private String details;

    /**
     * Thời điểm tạo log.
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}


