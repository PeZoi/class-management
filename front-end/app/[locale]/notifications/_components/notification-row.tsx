'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationItem, NotificationType } from '@/types';
import { Check, CheckCircle2, CircleX, Info, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Dùng chỉ cho type, không gọi hook trong component này
type NotificationsPageT = ReturnType<typeof useTranslations<'notifications-page'>>;

// ── Config icon / màu theo type ─────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; iconClass: string; bgClass: string; badgeClass: string }
> = {
  info: {
    icon: Info,
    iconClass: 'text-blue-500',
    bgClass: 'bg-blue-100 dark:bg-blue-950',
    badgeClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  success: {
    icon: CheckCircle2,
    iconClass: 'text-green-500',
    bgClass: 'bg-green-100 dark:bg-green-950',
    badgeClass: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  },
  warning: {
    icon: TriangleAlert,
    iconClass: 'text-yellow-500',
    bgClass: 'bg-yellow-100 dark:bg-yellow-950',
    badgeClass: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  },
  error: {
    icon: CircleX,
    iconClass: 'text-red-500',
    bgClass: 'bg-red-100 dark:bg-red-950',
    badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
};

// ── Row component ───────────────────────────────────────────────────────────
interface NotificationRowProps {
  notification: NotificationItem;
  onMarkRead: () => void;
  formatRelativeTime: (d: Date | string) => string;
  formatDateTime: (d: Date | string) => string;
  t: NotificationsPageT;
}

export function NotificationRow({
  notification,
  onMarkRead,
  formatRelativeTime,
  formatDateTime,
  t,
}: NotificationRowProps) {
  const config = TYPE_CONFIG[notification.type as NotificationType] ?? TYPE_CONFIG['info'];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex gap-4 p-4 rounded-xl border transition-colors',
        notification.read
          ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
          : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/40',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full',
          config.bgClass,
        )}
      >
        <Icon className={cn('size-4', config.iconClass)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={cn(
                'text-sm leading-snug',
                !notification.read
                  ? 'font-semibold text-slate-900 dark:text-slate-100'
                  : 'font-medium text-slate-600 dark:text-slate-400',
              )}
            >
              {notification.title}
            </p>
            {/* Type badge */}
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium',
                config.badgeClass,
              )}
            >
              {t(`type_${notification.type}` as Parameters<typeof t>[0])}
            </span>
            {/* Unread dot */}
            {!notification.read && (
              <span className="size-2 shrink-0 rounded-full bg-blue-500" />
            )}
          </div>

          {/* Mark read button */}
          {!notification.read && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 shrink-0"
              onClick={onMarkRead}
            >
              <Check className="size-3 mr-1" />
              {t('markAsRead')}
            </Button>
          )}
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
          {notification.message}
        </p>

        {/* Time */}
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
          <span>{formatRelativeTime(notification.time)}</span>
          <span>·</span>
          <span>{formatDateTime(notification.time)}</span>
        </p>
      </div>
    </div>
  );
}


