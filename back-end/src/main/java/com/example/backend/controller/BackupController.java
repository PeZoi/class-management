package com.example.backend.controller;

import com.example.backend.service.DatabaseBackupService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller để quản lý backup database.
 */
@Slf4j
@RestController
@RequestMapping("/api/backup")
@RequiredArgsConstructor
public class BackupController {

    private final DatabaseBackupService databaseBackupService;

    /**
     * Endpoint để trigger backup database thủ công và gửi qua Telegram.
     *
     * @return Thông tin về kết quả backup
     */
    @PostMapping("/database")
    public ResponseEntity<Map<String, Object>> backupDatabase() {
        log.info("Nhận yêu cầu backup database thủ công");

        Map<String, Object> response = new HashMap<>();

        try {
            String dumpFilePath = databaseBackupService.backupAndSendToTelegram();

            if (dumpFilePath != null) {
                response.put("success", true);
                response.put("message", "Backup database thành công và đã gửi qua Telegram");
                response.put("filePath", dumpFilePath);
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Backup database thất bại");
                return ResponseEntity.internalServerError().body(response);
            }
        } catch (Exception e) {
            log.error("Lỗi khi backup database: {}", e.getMessage(), e);
            response.put("success", false);
            response.put("message", "Lỗi: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

