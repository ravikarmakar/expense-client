import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationsApi, readNotificationsApi } from './notification.api';

export const notificationKeys = {
  all: () => ['notifications'] as const,
};

export const useNotifications = () =>
  useQuery({
    queryKey: notificationKeys.all(),
    queryFn: getNotificationsApi,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // poll every 60 seconds
    refetchOnWindowFocus: true, // refetch on app focus
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
