package com.example.backend.service;

import com.example.backend.dto.notification.NotificationPageResponse;
import com.example.backend.dto.notification.NotificationResponse;
import com.example.backend.entity.Notification;
import com.example.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
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

    /**
     * Get all notifications wrapped in NotificationPageResponse (for backward compatibility)
     * @return NotificationPageResponse with all items and hasMore=false
     */
    public NotificationPageResponse getAllNotificationsAsPageResponse() {
        List<NotificationResponse> items = getAllNotifications();
        return NotificationPageResponse.builder()
                .items(items)
                .nextCursor(null)
                .hasMore(false)
                .size(items.size())
                .build();
    }

    /**
     * Cursor-based pagination for infinite scroll
     * @param cursor Cursor time (ISO string), null means get latest
     * @param size Page size (default 20)
     * @return NotificationPageResponse with items and next cursor
     */
    public NotificationPageResponse getAllNotificationsPaginated(String cursor, Integer size) {
        int pageSize = (size != null && size > 0) ? Math.min(size, 100) : 20; // Max 100 items per page
        Pageable pageable = PageRequest.of(0, pageSize);
        
        Instant beforeTime = null;
        if (cursor != null && !cursor.isBlank()) {
            try {
                beforeTime = Instant.parse(cursor);
            } catch (Exception e) {
                // Invalid cursor, ignore and return latest
            }
        }
        
        List<Notification> notifications = notificationRepository.findAllBeforeTimeOrderByTimeDesc(beforeTime, pageable);
        List<NotificationResponse> items = notifications.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        // Determine next cursor and hasMore
        String nextCursor = null;
        boolean hasMore = false;
        if (!notifications.isEmpty()) {
            Instant lastTime = notifications.get(notifications.size() - 1).getTime();
            nextCursor = lastTime.toString();
            // Check if there are more items after this cursor
            List<Notification> checkMore = notificationRepository.findAllBeforeTimeOrderByTimeDesc(lastTime, PageRequest.of(0, 1));
            hasMore = !checkMore.isEmpty();
        }
        
        return NotificationPageResponse.builder()
                .items(items)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .size(items.size())
                .build();
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
