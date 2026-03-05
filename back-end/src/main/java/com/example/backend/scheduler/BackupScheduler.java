package com.example.backend.scheduler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.backend.service.DatabaseBackupService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Scheduled task để tự động backup database định kỳ.
 * 
 * Cấu hình trong application.properties:
 * - app.backup.enabled=true để bật tự động backup
 * - app.backup.cron để cấu hình lịch backup (mặc định: hàng ngày lúc 2:00 AM)
 * - app.backup.keep-files=5 để giữ lại số file backup (mặc định: 5)
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BackupScheduler {

    private final DatabaseBackupService databaseBackupService;

    @Value("${app.backup.enabled:false}")
    private boolean backupEnabled;

    @Value("${app.backup.keep-files:5}")
    private int keepFiles;

    /**
     * Tự động backup database hàng ngày lúc 2:00 AM.
     * 
     * Ví dụ cron expression:
     * - "0 0 2 * * ?"    = 2:00 AM mỗi ngày
     * - "0 0 0/6 * * ?"  = Mỗi 6 giờ
     * - "0 0 0 * * ?"    = Nửa đêm mỗi ngày
     * - "0 0 0 * * MON"  = Nửa đêm mỗi thứ 2
     */
    @Scheduled(cron = "${app.backup.cron:0 0 2 * * ?}")
    public void scheduledBackup() {
        if (!backupEnabled) {
            log.debug("Tự động backup đã bị tắt trong cấu hình");
            return;
        }

        log.info("Bắt đầu tự động backup database theo lịch");
        
        try {
            String dumpFilePath = databaseBackupService.backupAndSendToTelegram();
            
            if (dumpFilePath != null) {
                log.info("Tự động backup thành công: {}", dumpFilePath);
                
                // Cleanup các file backup cũ
                databaseBackupService.cleanupOldBackups(keepFiles);
            } else {
                log.error("Tự động backup thất bại");
            }
        } catch (Exception e) {
            log.error("Lỗi khi tự động backup database: {}", e.getMessage(), e);
        }
    }
}
