'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  isWithinInterval,
  startOfDay,
  endOfDay,
  parse,
  formatDistanceToNow,
} from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

import {
  useInfiniteNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/use-notifications';
import { NotificationFilterState } from '@/types';
import { NotificationsFilter } from './_components/notifications-filter';
import { NotificationRow } from './_components/notification-row';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bell,
  BellOff,
  Check,
  Loader2,
} from 'lucide-react';

// ── URL helpers ──────────────────────────────────────────────────────────────
const parseFiltersFromURL = (params: URLSearchParams): NotificationFilterState => ({
  searchQuery: params.get('search') || '',
  type: (params.get('type') as NotificationFilterState['type']) || 'all',
  status: (params.get('status') as NotificationFilterState['status']) || 'all',
  startDate: params.get('from') || undefined,
  endDate: params.get('to') || undefined,
});

const filtersToURLParams = (f: NotificationFilterState): URLSearchParams => {
  const p = new URLSearchParams();
  if (f.searchQuery) p.set('search', f.searchQuery);
  if (f.type !== 'all') p.set('type', f.type);
  if (f.status !== 'all') p.set('status', f.status);
  if (f.startDate) p.set('from', f.startDate);
  if (f.endDate) p.set('to', f.endDate);
  return p;
};

// ── Helper: UI date "dd/MM/yyyy" -> Date ─────────────────────────────────────
const parseUIDate = (dateStr?: string): Date | null => {
  if (!dateStr) return null;
  try {
    return parse(dateStr, 'dd/MM/yyyy', new Date());
  } catch {
    return null;
  }
};

// ── Helper: FE đang nhận Instant ISO (UTC) nhưng DB time đã là giờ local VN.
// Để hiển thị đúng như DB, ta bỏ hậu tố 'Z' và parse như local time. ──────────
const parseNotificationTime = (value: string | Date): Date => {
  if (value instanceof Date) return value;
  const raw = value.endsWith('Z') ? value.slice(0, -1) : value;
  return new Date(raw);
};

const PAGE_SIZE = 20;

// ── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const t = useTranslations('notifications-page');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isUpdatingFromURL = useRef(false);

  const [filters, setFilters] = useState<NotificationFilterState>(() =>
    parseFiltersFromURL(searchParams)
  );

  const {
    data: notifications = [],
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteNotifications(PAGE_SIZE);
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Infinite scroll: IntersectionObserver để load more ──────────────────────
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ── Sync filters -> URL ──────────────────────────────────────────────────
  useEffect(() => {
    if (isUpdatingFromURL.current) {
      isUpdatingFromURL.current = false;
      return;
    }
    const urlParams = filtersToURLParams(filters);
    const newURL = urlParams.toString() ? `${pathname}?${urlParams.toString()}` : pathname;
    if (searchParams.toString() !== urlParams.toString()) {
      router.replace(newURL, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]);

  // ── Sync URL -> filters (back/forward) ──────────────────────────────────
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    if (JSON.stringify(filters) !== JSON.stringify(urlFilters)) {
      isUpdatingFromURL.current = true;
      setFilters(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // ── Client-side filtering ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const fromDate = parseUIDate(filters.startDate);
    const toDate = parseUIDate(filters.endDate);
    const query = filters.searchQuery.toLowerCase().trim();

    return notifications.filter((n) => {
      // Search
      if (query) {
        const inTitle = n.title?.toLowerCase().includes(query);
        const inMsg = n.message?.toLowerCase().includes(query);
        if (!inTitle && !inMsg) return false;
      }
      // Type
      if (filters.type !== 'all' && n.type !== filters.type) return false;
      // Status
      if (filters.status === 'read' && !n.read) return false;
      if (filters.status === 'unread' && n.read) return false;
      // Date range
      if (fromDate || toDate) {
        const notifDate = parseNotificationTime(n.time);
        if (fromDate && toDate) {
          if (!isWithinInterval(notifDate, { start: startOfDay(fromDate), end: endOfDay(toDate) })) {
            return false;
          }
        } else if (fromDate && notifDate < startOfDay(fromDate)) {
          return false;
        } else if (toDate && notifDate > endOfDay(toDate)) {
          return false;
        }
      }
      return true;
    });
  }, [notifications, filters]);

  // ── Format thời gian: dùng date-fns formatDistanceToNow ──────────────────
  const formatRelativeTime = (dateInput: Date | string): string => {
    const date = parseNotificationTime(dateInput);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === 'vi' ? vi : enUS,
    });
  };

  const formatDateTime = (dateInput: Date | string): string => {
    const date = parseNotificationTime(dateInput);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasFilters =
    !!filters.searchQuery ||
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    !!filters.startDate ||
    !!filters.endDate;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Filter */}
      <NotificationsFilter filters={filters} onFilterChange={setFilters} />

      {/* Card */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Bell className="size-6 text-blue-500" />
                {t('title')}
              </CardTitle>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('description')}
              </p>
            </div>

            {/* Summary badges + action */}
            <div className="flex items-center gap-2 shrink-0">
              {!isLoading && (
                <>
                  <Badge variant="outline" className="text-xs gap-1 text-slate-600 dark:text-slate-300">
                    {t('totalCount', { count: notifications.length })}
                  </Badge>
                  {unreadCount > 0 && (
                    <Badge className="text-xs gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      <Bell className="size-3" />
                      {t('unreadCount', { count: unreadCount })}
                    </Badge>
                  )}
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => markAllAsRead.mutate()}
                      disabled={markAllAsRead.isPending}
                    >
                      {markAllAsRead.isPending
                        ? <Loader2 className="size-3 mr-1.5 animate-spin" />
                        : <Check className="size-3 mr-1.5" />
                      }
                      {t('markAllRead')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Loading */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <Loader2 className="size-8 animate-spin opacity-40" />
              <p className="text-sm">Đang tải...</p>
            </div>
          ) : filtered.length === 0 ? (
            /* Empty */
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <BellOff className="size-12 opacity-30" />
              <p className="text-sm">{hasFilters ? t('emptyFiltered') : t('empty')}</p>
            </div>
          ) : (
            <div className="max-h-[calc(100vh-360px)] overflow-y-auto min-h-0 pr-1">
              <div className="space-y-2">
                {filtered.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onMarkRead={() => markAsRead.mutate(notification.id)}
                    formatRelativeTime={formatRelativeTime}
                    formatDateTime={formatDateTime}
                    t={t}
                  />
                ))}
                
                {/* Infinite scroll trigger */}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="py-4">
                    {isFetchingNextPage && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span>{t('loading')}</span>
                      </div>
                    )}
                  </div>
                )}
                {!hasNextPage && filtered.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground py-4">
                    {t('noMoreNotifications')}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}