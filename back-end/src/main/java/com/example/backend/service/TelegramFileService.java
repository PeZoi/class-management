package com.example.backend.service;

import com.example.backend.config.LoggingProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;

/**
 * Service để gửi file qua Telegram Bot API.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramFileService {

    private final LoggingProperties loggingProperties;
    private final RestTemplate restTemplate = new RestTemplate();

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

        try {
            String url = TELEGRAM_API_BASE_URL + botToken + "/sendDocument";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("chat_id", chatId);
            body.add("document", new org.springframework.core.io.FileSystemResource(file));
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
                log.info("Đã gửi file {} qua Telegram thành công", file.getName());
                return true;
            } else {
                log.error("Gửi file qua Telegram thất bại: {}", response.getBody());
                return false;
            }
        } catch (Exception e) {
            log.error("Lỗi khi gửi file qua Telegram: {}", e.getMessage(), e);
            return false;
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

