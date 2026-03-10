package com.example.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service để dump MySQL database và gửi file dump qua Telegram.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DatabaseBackupService {

    private final TelegramFileService telegramFileService;
    private final NotificationService notificationService;

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    private static final String BACKUP_DIR = "ops/backup";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");

    /**
     * Dump database MySQL và gửi file dump qua Telegram.
     *
     * @return Đường dẫn file dump đã tạo, hoặc null nếu thất bại
     */
    public String backupAndSendToTelegram() {
        try {
            // Tạo thư mục backup nếu chưa tồn tại
            Path backupDir = Paths.get(BACKUP_DIR);
            if (!Files.exists(backupDir)) {
                Files.createDirectories(backupDir);
            }

            // Lấy tên database từ URL
            String databaseName = extractDatabaseName(datasourceUrl);
            if (databaseName == null) {
                log.error("Không thể lấy tên database từ URL: {}", datasourceUrl);
                return null;
            }

            // Tạo tên file dump
            String timestamp = LocalDateTime.now().format(DATE_FORMATTER);
            String dumpFileName = String.format("%s_%s.sql", databaseName, timestamp);
            Path dumpFilePath = backupDir.resolve(dumpFileName);

            // Thực hiện dump database
            log.info("Bắt đầu dump database: {}", databaseName);

            String host = extractHost(datasourceUrl);
            int port = extractPort(datasourceUrl);

            // Nếu host là localhost, 127.0.0.1, hoặc 172.17.0.1 (Docker gateway),
            // thay bằng host.docker.internal để container có thể kết nối đến MySQL trên host VPS
            // host.docker.internal đáng tin cậy hơn và hoạt động tốt trên cả Linux và Windows
            if (host != null && (host.equals("localhost") || host.equals("127.0.0.1") || host.equals("172.17.0.1"))) {
                String originalHost = host;
                host = "host.docker.internal";
                log.info("Đã thay đổi host từ {} thành host.docker.internal để kết nối từ container", originalHost);
            }

            if (host != null) {
                log.info("Host MySQL dùng để backup: {}:{}", host, port);
            }

            boolean dumpSuccess = dumpDatabase(databaseName, host, port, dumpFilePath.toFile());

            if (!dumpSuccess) {
                log.error("Dump database thất bại");
                return null;
            }

            log.info("Dump database thành công: {}", dumpFilePath);

            // Gửi file dump qua Telegram
            String caption = String.format(
                    "🗄️ SAO LƯU DATABASE\n" +
                    "-------------------------\n" +
                    "🧩 Database: %s\n" +
                    "📅 Thời gian: %s\n" +
                    "📁 File: %s\n" +
                    "\n#backup #success",
                    databaseName,
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                    dumpFileName
            );

            boolean sendSuccess = telegramFileService.sendFile(dumpFilePath.toFile(), caption);

            if (sendSuccess) {
                log.info("Đã gửi file dump qua Telegram thành công");

                // Thử xóa file dump sau khi đã gửi thành công lên Telegram
                try {
                    boolean deleted = dumpFilePath.toFile().delete();
                    if (deleted) {
                        log.info("Đã xóa file dump local sau khi gửi Telegram: {}", dumpFilePath);
                    } else {
                        log.warn("Không thể xóa file dump local: {}", dumpFilePath);
                    }
                } catch (Exception ex) {
                    log.warn("Lỗi khi xóa file dump local: {}", ex.getMessage(), ex);
                }

                // Gửi thông báo thành công
                telegramFileService.sendMessage("✅ Backup database thành công!\n📁 File: " + dumpFileName + "\n\n#backup #success");
                try {
                    notificationService.createNotification(
                            "success",
                            "Sao lưu thành công",
                            "Database đã được sao lưu thành công. File: " + dumpFileName
                    );
                } catch (Exception e) {
                    log.error("Không thể lưu thông báo sao lưu vào DB: {}", e.getMessage());
                }
            } else {
                log.error("Gửi file dump qua Telegram thất bại");
                telegramFileService.sendMessage("❌ Backup database thành công nhưng gửi qua Telegram thất bại\n📁 File (vẫn lưu trên server): " + dumpFilePath.toAbsolutePath() + "\n\n#backup #failed");
                try {
                    notificationService.createNotification(
                            "warning",
                            "Lỗi tải lên Telegram",
                            "Backup thành công nhưng gửi qua Telegram thất bại. File: " + dumpFileName
                    );
                } catch (Exception e) {
                    log.error("Không thể lưu thông báo sao lưu vào DB: {}", e.getMessage());
                }
            }

            return dumpFilePath.toAbsolutePath().toString();

        } catch (Exception e) {
            log.error("Lỗi khi backup database: {}", e.getMessage(), e);
            telegramFileService.sendMessage("❌ Lỗi khi backup database: " + e.getMessage() + "\n\n#backup #failed #error");
            try {
                notificationService.createNotification(
                        "error",
                        "Lỗi sao lưu database",
                        "Quá trình sao lưu thất bại: " + e.getMessage()
                );
            } catch (Exception ex) {
                log.error("Không thể lưu thông báo lỗi sao lưu vào DB: {}", ex.getMessage());
            }
            return null;
        }
    }

    /**
     * Extract database name từ JDBC URL.
     * Ví dụ: jdbc:mysql://localhost:3306/class_management?params -> class_management
     */
    private String extractDatabaseName(String jdbcUrl) {
        if (jdbcUrl == null || jdbcUrl.isBlank()) {
            return null;
        }

        // Bỏ prefix jdbc:mysql://
        String prefix = "jdbc:mysql://";
        String withoutPrefix = jdbcUrl;
        if (jdbcUrl.startsWith(prefix)) {
            withoutPrefix = jdbcUrl.substring(prefix.length());
        }

        // Tìm dấu / đầu tiên sau host:port (đây là database name)
        // Format: host:port/database?params hoặc host/database?params
        int slashIndex = withoutPrefix.indexOf('/');
        if (slashIndex == -1) {
            return null;
        }

        String afterSlash = withoutPrefix.substring(slashIndex + 1);
        
        // Tách database name trước dấu ? (query string)
        int questionMark = afterSlash.indexOf('?');
        if (questionMark != -1) {
            return afterSlash.substring(0, questionMark);
        }

        return afterSlash;
    }

    /**
     * Extract host từ JDBC URL.
     * Ví dụ: jdbc:mysql://localhost:3306/class_management -> localhost
     */
    private String extractHost(String jdbcUrl) {
        if (jdbcUrl == null || jdbcUrl.isBlank()) {
            return null;
        }

        // Bỏ prefix jdbc:mysql://
        String prefix = "jdbc:mysql://";
        String withoutPrefix = jdbcUrl;
        if (jdbcUrl.startsWith(prefix)) {
            withoutPrefix = jdbcUrl.substring(prefix.length());
        }

        // withoutPrefix: host:port/database?params hoặc host/database?params
        int slashIndex = withoutPrefix.indexOf('/');
        if (slashIndex == -1) {
            return null;
        }

        String hostPortPart = withoutPrefix.substring(0, slashIndex);
        // hostPortPart: host hoặc host:port
        int colonIndex = hostPortPart.indexOf(':');
        if (colonIndex == -1) {
            return hostPortPart;
        }

        return hostPortPart.substring(0, colonIndex);
    }

    /**
     * Extract port từ JDBC URL.
     * Ví dụ: jdbc:mysql://localhost:3306/class_management -> 3306
     * Nếu không parse được thì trả về 3306 (mặc định MySQL).
     */
    private int extractPort(String jdbcUrl) {
        if (jdbcUrl == null || jdbcUrl.isBlank()) {
            return 3306;
        }

        String prefix = "jdbc:mysql://";
        String withoutPrefix = jdbcUrl;
        if (jdbcUrl.startsWith(prefix)) {
            withoutPrefix = jdbcUrl.substring(prefix.length());
        }

        int slashIndex = withoutPrefix.indexOf('/');
        if (slashIndex == -1) {
            return 3306;
        }

        String hostPortPart = withoutPrefix.substring(0, slashIndex);
        int colonIndex = hostPortPart.indexOf(':');
        if (colonIndex == -1) {
            return 3306;
        }

        String portStr = hostPortPart.substring(colonIndex + 1);
        try {
            return Integer.parseInt(portStr);
        } catch (NumberFormatException e) {
            log.warn("Không parse được port từ JDBC URL: {}", jdbcUrl);
            return 3306;
        }
    }

    /**
     * Thực hiện dump MySQL database bằng mysqldump command.
     */
    private boolean dumpDatabase(String databaseName, String host, int port, File outputFile) {
        try {
            // Xây dựng command mysqldump
            List<String> command = new ArrayList<>();
            command.add("mysqldump");
            command.add("--single-transaction");
            command.add("--quick");
            command.add("--lock-tables=false");
            command.add("--routines");
            command.add("--triggers");
            // Bỏ qua SSL để tránh lỗi với self-signed certificate
            command.add("--skip-ssl");

            // Thêm host/port nếu parse được từ JDBC URL
            if (host != null && !host.isBlank()) {
                command.add("-h");
                command.add(host);
            }
            if (port > 0) {
                command.add("-P");
                command.add(String.valueOf(port));
            }

            command.add("-u");
            command.add(datasourceUsername);
            
            // Sử dụng -p (không có password sau -p) để mysqldump đọc từ stdin hoặc dùng MYSQL_PWD env
            // Nhưng để đơn giản, dùng -p với password (có thể có vấn đề nếu password có ký tự đặc biệt)
            // Nếu có vấn đề, có thể chuyển sang dùng MYSQL_PWD environment variable
            if (datasourcePassword != null && !datasourcePassword.isBlank()) {
                command.add("-p" + datasourcePassword);
            }
            
            command.add(databaseName);

            // Log command (không log password)
            log.info("Đang thực thi mysqldump với host: {}, port: {}, user: {}, database: {}", 
                    host, port, datasourceUsername, databaseName);

            // Thực thi command
            ProcessBuilder processBuilder = new ProcessBuilder(command);
            processBuilder.redirectOutput(outputFile);
            // Tách stderr để đọc lỗi chi tiết
            processBuilder.redirectErrorStream(false);

            Process process = processBuilder.start();

            // Đọc stderr để lấy thông báo lỗi chi tiết
            StringBuilder errorOutput = new StringBuilder();
            try (java.io.BufferedReader errorReader = new java.io.BufferedReader(
                    new java.io.InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = errorReader.readLine()) != null) {
                    errorOutput.append(line).append("\n");
                }
            }

            int exitCode = process.waitFor();

            if (exitCode == 0) {
                log.info("mysqldump hoàn thành thành công");
                return true;
            } else {
                String errorMsg = errorOutput.toString().trim();
                if (!errorMsg.isEmpty()) {
                    log.error("mysqldump thất bại với exit code: {}. Chi tiết lỗi: {}", exitCode, errorMsg);
                } else {
                    log.error("mysqldump thất bại với exit code: {} (không có thông báo lỗi chi tiết)", exitCode);
                }
                return false;
            }

        } catch (IOException e) {
            log.error("Lỗi IO khi dump database: {}", e.getMessage(), e);
            return false;
        } catch (InterruptedException e) {
            log.error("Process bị gián đoạn: {}", e.getMessage(), e);
            Thread.currentThread().interrupt();
            return false;
        } catch (Exception e) {
            log.error("Lỗi không xác định khi dump database: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Xóa các file backup cũ (giữ lại N file gần nhất).
     *
     * @param keepCount Số file cần giữ lại
     */
    public void cleanupOldBackups(int keepCount) {
        try {
            Path backupDir = Paths.get(BACKUP_DIR);
            if (!Files.exists(backupDir)) {
                return;
            }

            File[] backupFiles = backupDir.toFile().listFiles((dir, name) -> name.endsWith(".sql"));
            if (backupFiles == null || backupFiles.length <= keepCount) {
                return;
            }

            // Sắp xếp theo thời gian sửa đổi (mới nhất trước)
            java.util.Arrays.sort(backupFiles, (f1, f2) -> Long.compare(f2.lastModified(), f1.lastModified()));

            // Xóa các file cũ
            for (int i = keepCount; i < backupFiles.length; i++) {
                boolean deleted = backupFiles[i].delete();
                if (deleted) {
                    log.info("Đã xóa file backup cũ: {}", backupFiles[i].getName());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi cleanup backup files: {}", e.getMessage(), e);
        }
    }
}

