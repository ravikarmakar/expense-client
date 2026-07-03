import { getApiClient } from '../client';
import { notificationListResponseSchema, type NotificationItem } from './notification.types';

export const getNotificationsApi = async (): Promise<NotificationItem[]> => {
  const { data } = await getApiClient().get<unknown>('/notifications');
  const parsed = notificationListResponseSchema.parse(data);
  return parsed.data.notifications;
};

export const readNotificationsApi = async (): Promise<void> => {
  await getApiClient().post('/notifications/read');
};
