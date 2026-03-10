package com.example.backend.service;

import com.example.backend.config.LoggingProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.zip.GZIPOutputStream;

/**
 * Service để gửi file qua Telegram Bot API.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramFileService {

    private final LoggingProperties loggingProperties;

    // RestTemplate với timeout cao hơn để upload file lớn
    private final RestTemplate restTemplate = buildRestTemplate();

    private static RestTemplate buildRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(30_000);   // 30s connect timeout
        factory.setReadTimeout(180_000);     // 120s read timeout (đủ để upload file lớn)
        return new RestTemplate(factory);
    }

    private static final String TELEGRAM_API_BASE_URL = "https://api.telegram.org/bot";

    /**
     * Gửi file qua Telegram Bot API.
     *
     * @param file File cần gửi
     * @param caption Caption cho file (tùy chọn)
     * @return true nếu gửi thành công, false nếu thất bại
     */
    public boolean sendFile(File file, String caption) {
        if (!loggingProperties.getTelegram().isEnabled()) {
            log.warn("Telegram không được bật trong cấu hình");
            return false;
        }

        String botToken = loggingProperties.getTelegram().getBotToken();
        String chatId = loggingProperties.getTelegram().getChatId();

        if (botToken == null || botToken.isBlank() || chatId == null || chatId.isBlank()) {
            log.warn("Thiếu botToken hoặc chatId trong cấu hình Telegram");
            return false;
        }

        if (file == null || !file.exists()) {
            log.error("File không tồn tại: {}", file != null ? file.getAbsolutePath() : "null");
            return false;
        }

        // Nén file thành .gz để giảm kích thước trước khi upload
        File fileToSend = file;
        File gzipFile = null;
        try {
            if (!file.getName().endsWith(".gz")) {
                gzipFile = compressToGzip(file);
                if (gzipFile != null) {
                    long originalSize = file.length();
                    long compressedSize = gzipFile.length();
                    log.info("Đã nén file: {} ({} KB → {} KB, giảm {}%)",
                            file.getName(),
                            originalSize / 1024,
                            compressedSize / 1024,
                            (int) ((1.0 - (double) compressedSize / originalSize) * 100));
                    fileToSend = gzipFile;
                }
            }

            String url = TELEGRAM_API_BASE_URL + botToken + "/sendDocument";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("chat_id", chatId);
            body.add("document", new org.springframework.core.io.FileSystemResource(fileToSend));
            if (caption != null && !caption.isBlank()) {
                body.add("caption", caption);
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Đã gửi file {} qua Telegram thành công", fileToSend.getName());
                return true;
            } else {
                log.error("Gửi file qua Telegram thất bại: {}", response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi file qua Telegram: {}", e.getMessage(), e);
            return false;
        } finally {
            // Xóa file nén tạm sau khi gửi
            if (gzipFile != null && gzipFile.exists()) {
                gzipFile.delete();
            }
        }
    }

    /**
     * Nén file thành .gz để giảm kích thước trước khi upload lên Telegram.
     */
    private File compressToGzip(File sourceFile) {
        File gzipFile = new File(sourceFile.getParent(), sourceFile.getName() + ".gz");
        try (FileInputStream fis = new FileInputStream(sourceFile);
             FileOutputStream fos = new FileOutputStream(gzipFile);
             GZIPOutputStream gzos = new GZIPOutputStream(fos)) {
            byte[] buffer = new byte[8192];
            int len;
            while ((len = fis.read(buffer)) != -1) {
                gzos.write(buffer, 0, len);
            }
            return gzipFile;
        } catch (IOException e) {
            log.warn("Không thể nén file, sẽ gửi file gốc: {}", e.getMessage());
            if (gzipFile.exists()) gzipFile.delete();
            return null;
        }
    }

    /**
     * Gửi message text qua Telegram.
     *
     * @param message Nội dung message
     * @return true nếu gửi thành công, false nếu thất bại
     */
    public boolean sendMessage(String message) {
        if (!loggingProperties.getTelegram().isEnabled()) {
            log.warn("Telegram không được bật trong cấu hình");
            return false;
        }

        String botToken = loggingProperties.getTelegram().getBotToken();
        String chatId = loggingProperties.getTelegram().getChatId();

        if (botToken == null || botToken.isBlank() || chatId == null || chatId.isBlank()) {
            log.warn("Thiếu botToken hoặc chatId trong cấu hình Telegram");
            return false;
        }

        try {
            String url = TELEGRAM_API_BASE_URL + botToken + "/sendMessage";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("chat_id", chatId);
            body.put("text", message);

            HttpEntity<java.util.Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("Đã gửi message qua Telegram thành công");
                return true;
            } else {
                log.error("Gửi message qua Telegram thất bại: {}", response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi message qua Telegram: {}", e.getMessage(), e);
            return false;
        }
    }
}

