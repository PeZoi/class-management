package com.example.backend.dto.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Generic pagination response wrapper
 * @param <T> Type of content in the page
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> {
    private List<T> content;           // List of items in this page
    private int page;                   // Current page number (0-based)
    private int size;                   // Number of items per page
    private long totalElements;         // Total number of items across all pages
    private int totalPages;             // Total number of pages
    private boolean hasNext;            // Whether there is a next page
    private boolean hasPrevious;        // Whether there is a previous page
}

