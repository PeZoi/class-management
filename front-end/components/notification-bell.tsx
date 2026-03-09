'use client';

import { useState } from 'react';
import { Bell, Check, Info, TriangleAlert, CircleX, CircleCheck, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

// ========================
// Types
// ========================
type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

// ========================
// Mock data (thay bằng API thực sau)
// ========================
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'error',
    title: 'Lỗi sao lưu database',
    message: 'Backup lúc 02:00 AM thất bại. Vui lòng kiểm tra lại cấu hình.',
    time: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Học sinh sắp nợ học phí',
    message: '3 học sinh có học phí đến hạn trong 3 ngày tới.',
    time: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Sao lưu thành công',
    message: 'Database đã được sao lưu thành công lúc 02:00 AM.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: false,
  },
  {
    id: '4',
    type: 'info',
    title: 'Hệ thống cập nhật',
    message: 'Phiên bản mới đã được triển khai thành công.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
  {
    id: '5',
    type: 'success',
    title: 'Thanh toán xác nhận',
    message: 'Nguyễn Văn A đã thanh toán học phí tháng 3.',
    time: new Date(Date.now() - 1000 * 60 * 60 * 25),
    read: true,
  },
];

// ========================
// Helper: format thời gian
// ========================
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return 'Hôm qua';
  return `${diffDays} ngày trước`;
}

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
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
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
        className="w-[380px] p-0 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Thông báo</h3>
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
              onClick={markAllAsRead}
            >
              <Check className="size-3 mr-1" />
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>

        {/* Notification List */}
        {notifications.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
            <BellOff className="size-10 opacity-40" />
            <p className="text-sm">Không có thông báo nào</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[420px]">
            <div className="divide-y">
              {notifications.map((notification) => {
                const config = TYPE_CONFIG[notification.type];
                const Icon = config.icon;

                return (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
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
                            !notification.read ? 'font-semibold' : 'font-medium text-muted-foreground'
                          )}
                        >
                          {notification.title}
                        </p>
                        {/* Unread dot */}
                        {!notification.read && (
                          <span className={cn('mt-1.5 size-2 shrink-0 rounded-full', config.dotClass)} />
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
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t px-4 py-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              Xem tất cả thông báo
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

