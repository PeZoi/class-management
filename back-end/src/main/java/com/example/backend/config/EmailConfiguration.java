package com.example.backend.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class EmailConfiguration {
    @Value("${gmail.email}")
    private String email;
    @Value("${gmail.password}")
    private String password;

    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        mailSender.setHost("smtp.gmail.com");
        // Port 465 sử dụng SSL trực tiếp (không dùng STARTTLS)
        mailSender.setPort(465);
        mailSender.setUsername(email);
        mailSender.setPassword(password);
        mailSender.setDefaultEncoding("UTF-8");
        mailSender.setProtocol("smtps"); // smtps cho SSL

        Properties properties = new Properties();
        
        // Authentication
        properties.setProperty("mail.smtp.auth", "true");
        
        // SSL configuration cho port 465 (KHÔNG dùng STARTTLS)
        properties.setProperty("mail.smtp.ssl.enable", "true");
        properties.setProperty("mail.smtp.ssl.trust", "smtp.gmail.com");
        properties.setProperty("mail.smtp.ssl.protocols", "TLSv1.2");
        
        // Socket factory settings cho port 465
        properties.setProperty("mail.smtp.socketFactory.port", "465");
        properties.setProperty("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        properties.setProperty("mail.smtp.socketFactory.fallback", "false");
        
        // Tăng timeout để tránh connection timeout
        properties.setProperty("mail.smtp.connectiontimeout", "30000"); // 30 giây
        properties.setProperty("mail.smtp.timeout", "30000"); // 30 giây
        properties.setProperty("mail.smtp.writetimeout", "30000"); // 30 giây
        
        // Disable debug để giảm log noise
        properties.setProperty("mail.debug", "false");
        
        mailSender.setJavaMailProperties(properties);

        return mailSender;
    }
}