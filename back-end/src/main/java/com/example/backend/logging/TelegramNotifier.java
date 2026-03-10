package com.example.backend.logging;

import com.example.backend.config.LoggingProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Gửi cảnh báo lỗi sang Telegram.
 * Thiết kế đơn giản, chạy async bằng CompletableFuture để không chặn request.
 */
@Service
@RequiredArgsConstructor
public class TelegramNotifier {

    private static final Logger log = LoggerFactory.getLogger(TelegramNotifier.class);

    private final LoggingProperties loggingProperties;

    @Value("${app.env:local}")
    private String appEnv;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final DateTimeFormatter TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Gửi cảnh báo lỗi (ERROR/CRITICAL) một cách bất đồng bộ.
     */
    public void sendErrorAlertAsync(String level, LogContext context, String message, Throwable error) {
        if (!loggingProperties.getTelegram().isEnabled()) {
            return;
        }
        String botToken = loggingProperties.getTelegram().getBotToken();
        String chatId = loggingProperties.getTelegram().getChatId();
        if (botToken == null || botToken.isBlank() || chatId == null || chatId.isBlank()) {
            log.warn("TelegramNotifier enabled nhưng thiếu botToken hoặc chatId");
            return;
        }

        CompletableFuture.runAsync(() -> {
            try {
                doSendErrorAlert(level, context, message, error, botToken, chatId);
            } catch (Exception ex) {
                log.warn("Gửi cảnh báo lỗi qua Telegram thất bại: {}", ex.getMessage());
            }
        });
    }

    private void doSendErrorAlert(String level,
                                  LogContext context,
                                  String message,
                                  Throwable error,
                                  String botToken,
                                  String chatId) {

        String serviceName = loggingProperties.getServiceName();
        if (serviceName == null || serviceName.isBlank()) {
            serviceName = "class-management-api";
        }

        String time = LocalDateTime.now().format(TIME_FORMATTER);

        // Chọn icon theo level để thông báo sinh động hơn
        String levelIcon = switch (level != null ? level.toUpperCase() : "") {
            case "CRITICAL" -> "\uD83D\uDEA8"; // 🚨
            case "ERROR" -> "\u274C";          // ❌
            case "WARN", "WARNING" -> "\u26A0\uFE0F"; // ⚠️
            default -> "\u2757";              // ❗
        };

        StringBuilder sb = new StringBuilder();
        // Header
        sb.append(levelIcon).append(" ")
                .append("[").append(appEnv.toUpperCase()).append("]")
                .append("[").append(level).append("]")
                .append("[").append(serviceName).append("]")
                .append("\n");
        sb.append("-----------------------------").append("\n");

        // Thông tin ngữ cảnh
        if (context != null) {
            if (context.getStatusCode() != null) {
                sb.append("\uD83D\uDCDB Status: ").append(context.getStatusCode()).append("\n"); // 📛
            }
            if (context.getRoute() != null) {
                sb.append("\uD83D\uDEE3 Route : ").append(context.getRoute()).append("\n"); // 🛣
            }
            if (context.getUserId() != null) {
                sb.append("\uD83D\uDC64 User  : ").append(context.getUserId()).append("\n"); // 👤
            }
            if (context.getIp() != null) {
                sb.append("\uD83D\uDCCD IP    : ").append(context.getIp()).append("\n"); // 📍
            }
        }

        // Message lỗi chính
        String shortMsg = message;
        if (shortMsg == null && error != null) {
            shortMsg = error.getMessage();
        }
        if (shortMsg == null) {
            shortMsg = "(no message)";
        }
        // Giới hạn độ dài message để tránh spam
        if (shortMsg.length() > 300) {
            shortMsg = shortMsg.substring(0, 500) + "...";
        }
        sb.append("\uD83D\uDCE2 Msg   : ").append(shortMsg).append("\n"); // 📢

        // Thêm 1 đoạn nhỏ payload (nếu có) cho lỗi quan trọng, giới hạn để tránh quá dài
        if (context != null && context.getPayload() != null && !context.getPayload().isBlank()) {
            String payload = context.getPayload().trim();
            if (payload.length() > 400) {
                payload = payload.substring(0, 400) + "...";
            }
            sb.append("\uD83D\uDCDD Body  : ").append(payload).append("\n"); // 📝
        }

        sb.append("\u23F0 Time  : ").append(time).append("\n"); // ⏰

        // Hashtag để lọc thông báo trong Telegram
        String tag = switch (level != null ? level.toUpperCase() : "") {
            case "CRITICAL" -> "\n#error #critical";
            case "WARN", "WARNING" -> "\n#error #warning";
            default -> "\n#error";
        };
        sb.append(tag);

        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("chat_id", chatId);
        body.put("text", sb.toString());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        restTemplate.postForEntity(url, entity, String.class);
    }
}


