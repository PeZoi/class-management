import http from '@/lib/http';
import { NotificationItem } from '@/types';

export interface NotificationPageResponse {
  items: NotificationItem[];
  nextCursor: string | null;
  hasMore: boolean;
  size: number;
}

export const notificationService = {
  getAll: () =>
    http.get<{ data: NotificationItem[] }>('/api/notifications'),

  getAllPaginated: (cursor?: string | null, size?: number) => {
    const params = new URLSearchParams();
    if (cursor) params.set('cursor', cursor);
    if (size) params.set('size', size.toString());
    const query = params.toString();
    return http.get<{ data: NotificationPageResponse }>(
      `/api/notifications${query ? `?${query}` : ''}`
    );
  },

  getTop5: () =>
    http.get<{ data: NotificationItem[] }>('/api/notifications/top5'),

  markAsRead: (id: string | number) =>
    http.put(`/api/notifications/${id}/read`, {}),

  markAllAsRead: () =>
    http.put('/api/notifications/read-all', {}),
};
