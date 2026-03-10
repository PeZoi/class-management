export type NotificationType = 'info' | 'success' | 'warning' | 'error' | string;

export interface NotificationItem {
  id: string | number;
  type: NotificationType;
  title: string;
  message: string;
  time: string | Date;
  read: boolean;
}

export interface NotificationFilterState {
  searchQuery: string;
  type: 'all' | 'info' | 'success' | 'warning' | 'error';
  status: 'all' | 'read' | 'unread';
  startDate?: string;
  endDate?: string;
}
