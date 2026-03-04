package com.example.backend.logging;

import com.example.backend.config.LoggingProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Lớp trung tâm để ghi log có kèm ngữ cảnh và (nếu cần) gửi cảnh báo Telegram.
 * Hiện tại chỉ dùng log file (Logback) + Telegram, không lưu DB.
 */
@Service
@RequiredArgsConstructor
public class LoggerService {

    private static final Logger log = LoggerFactory.getLogger(LoggerService.class);

    private final LoggingProperties loggingProperties;
    private final TelegramNotifier telegramNotifier;

    @Value("${app.env:local}")
    private String appEnv;

    public void info(LogContext context, String message) {
        log.info(buildMessagePrefix("INFO", context) + message);
    }

    public void warn(LogContext context, String message) {
        log.warn(buildMessagePrefix("WARN", context) + message);
    }

    public void error(LogContext context, Throwable error) {
        String prefix = buildMessagePrefix("ERROR", context);
        log.error(prefix + safeMessage(error), error);

        // Gửi Telegram nếu đã bật trong cấu hình (không phụ thuộc appEnv)
        if (loggingProperties.getTelegram().isEnabled()) {
            telegramNotifier.sendErrorAlertAsync("ERROR", context, safeMessage(error), error);
        }
    }

    public void critical(LogContext context, Throwable error) {
        String prefix = buildMessagePrefix("CRITICAL", context);
        log.error(prefix + safeMessage(error), error);

        if (loggingProperties.getTelegram().isEnabled()) {
            telegramNotifier.sendErrorAlertAsync("CRITICAL", context, safeMessage(error), error);
        }
    }

    private String buildMessagePrefix(String level, LogContext context) {
        StringBuilder sb = new StringBuilder();
        sb.append("[").append(appEnv.toUpperCase()).append("]")
                .append("[").append(level).append("]");

        String serviceName = loggingProperties.getServiceName();
        if (serviceName != null && !serviceName.isBlank()) {
            sb.append("[").append(serviceName).append("]");
        }
        sb.append(" ");

        if (context != null) {
            if (context.getRoute() != null) {
                sb.append("route=").append(context.getRoute()).append(" ");
            }
            if (context.getUserId() != null) {
                sb.append("userId=").append(context.getUserId()).append(" ");
            }
            if (context.getIp() != null) {
                sb.append("ip=").append(context.getIp()).append(" ");
            }
        }

        sb.append("- ");
        return sb.toString();
    }

    private String safeMessage(Throwable error) {
        if (error == null) {
            return "(no error message)";
        }
        String msg = error.getMessage();
        if (msg == null || msg.isBlank()) {
            return error.getClass().getSimpleName();
        }
        return msg;
    }
}


