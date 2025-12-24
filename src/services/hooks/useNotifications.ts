import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, NotificationFilters, Notification } from '../api/notificationApi';

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (filters?: NotificationFilters) => [...notificationKeys.all, 'list', filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

export function useNotifications(filters: NotificationFilters = {}, page: number = 1, limit: number = 20) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationApi.getNotifications(filters, page, limit),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => notificationApi.deleteNotification(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
