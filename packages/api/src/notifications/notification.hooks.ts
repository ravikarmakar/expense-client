import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationsApi, readNotificationsApi } from './notification.api';

export const notificationKeys = {
  all: () => ['notifications'] as const,
};

export const useNotifications = () =>
  useQuery({
    queryKey: notificationKeys.all(),
    queryFn: getNotificationsApi,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 15 * 1000, // poll every 15 seconds
  });

export const useReadNotifications = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: readNotificationsApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all() });
    },
  });
};
