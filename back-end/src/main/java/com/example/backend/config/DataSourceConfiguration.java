package com.example.backend.config;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;

import com.zaxxer.hikari.HikariDataSource;

import lombok.extern.slf4j.Slf4j;

/**
 * Configuration cho DataSource với các tham số MySQL tối ưu cho VPS
 * Tự động thêm các tham số connection vào JDBC URL để xử lý timeout tốt hơn
 */
@Configuration
@Slf4j
public class DataSourceConfiguration implements BeanPostProcessor {

    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof HikariDataSource) {
            HikariDataSource dataSource = (HikariDataSource) bean;
            String currentUrl = dataSource.getJdbcUrl();
            
            // Chỉ enhance URL nếu URL đã tồn tại
            if (StringUtils.hasText(currentUrl)) {
                String enhancedUrl = enhanceJdbcUrl(currentUrl);
                
                if (!enhancedUrl.equals(currentUrl)) {
                    dataSource.setJdbcUrl(enhancedUrl);
                    log.info("Enhanced JDBC URL with MySQL connection parameters for better VPS compatibility");
                }
            }
        }
        return bean;
    }

    /**
     * Thêm các tham số MySQL vào JDBC URL nếu chưa có
     * Các tham số này giúp xử lý timeout và reconnect tốt hơn trên VPS
     */
    private String enhanceJdbcUrl(String url) {
        if (!StringUtils.hasText(url)) {
            return url;
        }

        // Kiểm tra xem URL đã có tham số chưa
        if (url.contains("?")) {
            // URL đã có tham số, kiểm tra và thêm các tham số còn thiếu
            StringBuilder enhancedUrl = new StringBuilder(url);
            
            // Các tham số cần thiết cho VPS để xử lý timeout
            // Với wait_timeout=28800s (8 giờ), cần các tham số này để tránh connection bị đóng
            String[] requiredParams = {
                "autoReconnect=true",
                "useSSL=false",
                "serverTimezone=Asia/Ho_Chi_Minh",
                "allowPublicKeyRetrieval=true",
                "useUnicode=true",
                "characterEncoding=UTF-8",
                "connectTimeout=30000",
                "socketTimeout=60000",
                "netTimeoutForStreamingResults=60000",
                "tcpKeepAlive=true",
                "tcpNoDelay=true"
            };
            
            for (String param : requiredParams) {
                String key = param.split("=")[0];
                if (!url.contains(key + "=")) {
                    enhancedUrl.append(enhancedUrl.toString().endsWith("&") || enhancedUrl.toString().endsWith("?") 
                        ? "" : "&").append(param);
                }
            }
            
            return enhancedUrl.toString();
        } else {
            // URL chưa có tham số, thêm tất cả
            String params = "?autoReconnect=true" +
                    "&useSSL=false" +
                    "&serverTimezone=Asia/Ho_Chi_Minh" +
                    "&allowPublicKeyRetrieval=true" +
                    "&useUnicode=true" +
                    "&characterEncoding=UTF-8" +
                    "&connectTimeout=30000" +
                    "&socketTimeout=60000" +
                    "&netTimeoutForStreamingResults=60000" +
                    "&tcpKeepAlive=true" +
                    "&tcpNoDelay=true";
            return url + params;
        }
    }
}

