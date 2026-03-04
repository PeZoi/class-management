package com.example.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Cấu hình chung cho logging & cảnh báo lỗi (Telegram).
 */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.logging")
public class LoggingProperties {

    /**
     * Tên service để hiển thị trong log/Telegram.
     */
    private String serviceName;

    /**
     * Cấu hình Telegram cho việc gửi cảnh báo lỗi.
     */
    private final Telegram telegram = new Telegram();

    @Getter
    @Setter
    public static class Telegram {
        /**
         * Bật/tắt gửi cảnh báo lỗi qua Telegram.
         */
        private boolean enabled;

        /**
         * Bot token do @BotFather cấp.
         */
        private String botToken;

        /**
         * Chat ID (group/channel) nhận cảnh báo.
         */
        private String chatId;
    }
}


