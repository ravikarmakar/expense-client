import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getNotificationsApi, readNotificationsApi } from './notification.api';

export const notificationKeys = {
  all: () => ['notifications'] as const,
};

export const useNotifications = (limit = 15) =>
  useInfiniteQuery({
    queryKey: notificationKeys.all(),
    queryFn: ({ pageParam }) => getNotificationsApi(pageParam as string | undefined, limit),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
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
