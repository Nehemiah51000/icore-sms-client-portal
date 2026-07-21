import { api } from '../api';

export interface NotificationItem {
  id: string;
  type: string;
  data: { message: string; [key: string]: unknown };
  read_at: string | null;
  created_at: string;
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export function getNotifications() {
  return api.get<PaginatedResponse<NotificationItem>>('/client/notifications');
}

export function getUnreadCount() {
  return api.get<{ count: number }>('/client/notifications/unread-count');
}

export function markAsRead(id: string) {
  return api.put<{ message: string }>(`/client/notifications/${id}/read`, {});
}

export function markAllAsRead() {
  return api.put<{ message: string }>('/client/notifications/read-all', {});
}
