import { getApiClient } from '../client';
import { notificationListResponseSchema, type NotificationItem } from './notification.types';

export const getNotificationsApi = async (
  cursor?: string,
  limit = 15
): Promise<{ notifications: NotificationItem[]; nextCursor: string | null }> => {
  const { data } = await getApiClient().get<unknown>('/notifications', {
    params: { cursor, limit },
  });
  const parsed = notificationListResponseSchema.parse(data);
  return {
    notifications: parsed.data.notifications,
    nextCursor: parsed.data.nextCursor ?? null,
  };
};

export const readNotificationsApi = async (): Promise<void> => {
  await getApiClient().post('/notifications/read');
};
