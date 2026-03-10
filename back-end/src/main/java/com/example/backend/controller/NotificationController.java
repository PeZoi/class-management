package com.example.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.notification.NotificationPageResponse;
import com.example.backend.dto.notification.NotificationResponse;
import com.example.backend.service.NotificationService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get all notifications or paginated notifications (cursor-based)
     * @param cursor Optional cursor (ISO Instant string) for pagination.
     * @param size Optional page size (default 20, max 100).
     * @return NotificationPageResponse - if any pagination param is provided, returns paginated;
     *         otherwise returns all with hasMore=false
     */
    @GetMapping
    public ResponseEntity<NotificationPageResponse> getAll(
            @RequestParam(required = false) String cursor,
            @RequestParam(required = false) Integer size
    ) {
        // Nếu có cursor hoặc size -> dùng pagination
        if ((cursor != null && !cursor.isBlank()) || size != null) {
            return ResponseEntity.ok(notificationService.getAllNotificationsPaginated(cursor, size));
        }
        // Không có param nào -> trả về toàn bộ (backward compatible)
        return ResponseEntity.ok(notificationService.getAllNotificationsAsPageResponse());
    }

    @GetMapping("/top5")
    public ResponseEntity<List<NotificationResponse>> getTop5() {
        return ResponseEntity.ok(notificationService.getTop5Notifications());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok().build();
    }
}
