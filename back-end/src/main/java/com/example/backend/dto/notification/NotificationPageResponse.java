package com.example.backend.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Cursor-based pagination response for notifications (infinite scroll)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationPageResponse {
    private List<NotificationResponse> items;      // List of notifications in this page
    private String nextCursor;                     // Cursor (time) for next page, null if no more
    private boolean hasMore;                       // Whether there are more items
    private int size;                              // Number of items in this page
}

