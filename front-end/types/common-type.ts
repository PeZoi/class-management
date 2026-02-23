// Common types used across multiple modules

export type TimePeriod = '3months' | '6months' | '12months';

/**
 * Generic pagination response type matching backend PageResponse
 */
export interface PageResponse<T> {
  content: T[];              // List of items in this page
  page: number;              // Current page number (0-based)
  size: number;              // Number of items per page
  totalElements: number;     // Total number of items across all pages
  totalPages: number;        // Total number of pages
  hasNext: boolean;          // Whether there is a next page
  hasPrevious: boolean;      // Whether there is a previous page
}

