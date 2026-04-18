export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'booking' | 'message';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;
}

export interface NotificationsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  unreadCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationsPayload {
  notifications: AppNotification[];
  pagination: NotificationsPagination;
}

export interface NotificationsState {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isUpdating: boolean;
  error: string | null;
}

export type ContainerState = NotificationsState;
