package com.example.backend.service;

import com.example.backend.dto.notification.NotificationResponse;
import com.example.backend.entity.Notification;
import com.example.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional
    public void createNotification(String type, String title, String message) {
        Notification notification = new Notification();
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notificationRepository.save(notification);
    }

    public List<NotificationResponse> getAllNotifications() {
        return notificationRepository.findAllByOrderByTimeDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getTop5Notifications() {
        return notificationRepository.findTop5ByOrderByTimeDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    @Transactional
    public void markAllAsRead() {
        List<Notification> unread = notificationRepository.findAll().stream()
                .filter(n -> !Boolean.TRUE.equals(n.getIsRead()))
                .collect(Collectors.toList());
        unread.forEach(n -> n.setIsRead(true));
        if (!unread.isEmpty()) {
            notificationRepository.saveAll(unread);
        }
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .time(notification.getTime())
                .read(Boolean.TRUE.equals(notification.getIsRead()))
                .build();
    }
}
