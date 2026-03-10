'use client';

import { Bell, Check, Info, TriangleAlert, CircleX, CircleCheck, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { NotificationType } from '@/types';
import {
  useNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from '@/hooks/use-notifications';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

// ========================
// Helper: icon & màu theo type
// ========================
const TYPE_CONFIG: Record<
  NotificationType,
  { icon: React.ElementType; iconClass: string; dotClass: string }
> = {
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    dotClass: 'bg-blue-500',
  },
  success: {
    icon: CircleCheck,
    iconClass: 'text-green-500',
    dotClass: 'bg-green-500',
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'text-yellow-500',
    dotClass: 'bg-yellow-500',
  },
  error: {
    icon: CircleX,
    iconClass: 'text-destructive',
    dotClass: 'bg-destructive',
  },
};

// ========================
// Main Component
// ========================
export function NotificationBell() {
  const t = useTranslations('notification-bell');
  const locale = useLocale();
  const [open, setOpen] = useState(false);

  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Helper: parse Instant ISO (UTC) thành local time giống DB (bỏ 'Z')
  const parseNotificationTime = (value: string | Date): Date => {
    if (value instanceof Date) return value;
    const raw = value.endsWith('Z') ? value.slice(0, -1) : value;
    return new Date(raw);
  };

  // ── Helper: format thời gian tương đối (date-fns) ─────────────────────
  const formatRelativeTime = (dateInput: Date | string): string => {
    const date = parseNotificationTime(dateInput);
    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: locale === 'vi' ? vi : enUS,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-9 lg:size-10">
          <Bell className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 shadow-lg flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">{t('title')}</h3>
            {unreadCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => markAllAsRead.mutate()}
              disabled={markAllAsRead.isPending}
            >
              <Check className="size-3 mr-1" />
              {t('markAllRead')}
            </Button>
          )}
        </div>

        {/* Notification List */}
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin opacity-40" />
            <p className="text-sm">{t('loading')}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <BellOff className="size-10 opacity-40" />
            <p className="text-sm">{t('empty')}</p>
          </div>
        ) : (
          <div className="overflow-y-auto max-h-[60vh] min-h-0">
            <div className="divide-y">
              {notifications.map((notification) => {
                const config =
                  TYPE_CONFIG[notification.type as NotificationType] ?? TYPE_CONFIG['info'];
                const Icon = config.icon;

                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead.mutate(notification.id);
                      }
                    }}
                    className={cn(
                      'flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50',
                      !notification.read && 'bg-muted/30'
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full',
                        notification.type === 'info' && 'bg-blue-100 dark:bg-blue-950',
                        notification.type === 'success' && 'bg-green-100 dark:bg-green-950',
                        notification.type === 'warning' && 'bg-yellow-100 dark:bg-yellow-950',
                        notification.type === 'error' && 'bg-red-100 dark:bg-red-950',
                      )}
                    >
                      <Icon className={cn('size-4', config.iconClass)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm leading-snug',
                            !notification.read
                              ? 'font-semibold'
                              : 'font-medium text-muted-foreground'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span
                            className={cn('mt-1.5 size-2 shrink-0 rounded-full', config.dotClass)}
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {formatRelativeTime(notification.time)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="border-t px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href={`/${locale}/notifications`} onClick={() => setOpen(false)}>
              {t('viewAll')}
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
