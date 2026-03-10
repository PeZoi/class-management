/* eslint-disable @typescript-eslint/no-explicit-any */
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService, NotificationPageResponse } from '@/services';
import { NotificationItem } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

/**
 * Hook lấy toàn bộ thông báo (dùng cho trang xem tất cả) - DEPRECATED, dùng useInfiniteNotifications
 */
export function useAllNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: queryKeys.notifications.list(),
    queryFn: async () => {
      const res = await notificationService.getAll();
      return res?.data ?? [];
    },
  });
}

/**
 * Hook lấy thông báo với infinite scroll (cursor-based pagination)
 */
export function useInfiniteNotifications(pageSize: number = 20) {
  return useInfiniteQuery<NotificationPageResponse, Error, NotificationItem[]>({
    queryKey: queryKeys.notifications.list(),
    queryFn: async ({ pageParam }) => {
      const res = await notificationService.getAllPaginated(pageParam as string | null, pageSize);
      return res?.data ?? { items: [], nextCursor: null, hasMore: false, size: 0 };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: null as string | null,
    select: (data) => {
      // Flatten all pages into a single array
      return data.pages.flatMap((page) => page.items);
    },
  });
}

/**
 * Hook lấy top 5 thông báo mới nhất (dùng cho bell popover)
 */
export function useNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: queryKeys.notifications.top5(),
    queryFn: async () => {
      const res = await notificationService.getTop5();
      return res?.data ?? [];
    },
  });
}

/**
 * Hook đánh dấu 1 thông báo đã đọc (optimistic update)
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      // Update top5
      const prevTop5 = queryClient.getQueryData<NotificationItem[]>(queryKeys.notifications.top5());
      const markReadTop5 = (items?: NotificationItem[]) =>
        items?.map((n) => (n.id === id ? { ...n, read: true } : n)) ?? [];
      queryClient.setQueryData<NotificationItem[]>(queryKeys.notifications.top5(), markReadTop5);

      // Update infinite query (list)
      queryClient.setQueryData(queryKeys.notifications.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((n: NotificationItem) =>
              n.id === id ? { ...n, read: true } : n
            ),
          })),
        };
      });

      return { prevTop5 };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevTop5) queryClient.setQueryData(queryKeys.notifications.top5(), ctx.prevTop5);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}

/**
 * Hook đánh dấu tất cả thông báo đã đọc (optimistic update)
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.all });

      // Update top5
      const prevTop5 = queryClient.getQueryData<NotificationItem[]>(queryKeys.notifications.top5());
      const markAllReadTop5 = (items?: NotificationItem[]) =>
        items?.map((n) => ({ ...n, read: true })) ?? [];
      queryClient.setQueryData<NotificationItem[]>(queryKeys.notifications.top5(), markAllReadTop5);

      // Update infinite query (list)
      queryClient.setQueryData(queryKeys.notifications.list(), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            items: page.items.map((n: NotificationItem) => ({ ...n, read: true })),
          })),
        };
      });

      return { prevTop5 };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prevTop5) queryClient.setQueryData(queryKeys.notifications.top5(), ctx.prevTop5);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
    },
  });
}
