import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotificationsApi, readNotificationsApi } from './notification.api';

export const notificationKeys = {
  all: () => ['notifications'] as const,
};

export const useNotifications = () =>
  useQuery({
    queryKey: notificationKeys.all(),
    queryFn: getNotificationsApi,
    staleTime: Infinity, // Keep in cache, do not auto-refetch
    refetchOnWindowFocus: false, // Disable refetch on app focus
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
