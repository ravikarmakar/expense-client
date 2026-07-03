import { z } from 'zod';

export const notificationItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum([
    'GROUP_INVITATION',
    'EXPENSE_CREATED',
    'SETTLEMENT_COMPLETED',
    'GENERAL_INFO',
    'FRIEND_REQUEST',
    'REMINDER',
    'SECURITY',
    'ACTIVITY_FEED',
  ]),
  read: z.boolean(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string(),
  groupId: z.string().nullable().optional(),
  expenseId: z.string().nullable().optional(),
  settlementId: z.string().nullable().optional(),
  invitationId: z.string().nullable().optional(),
  metadata: z.any().nullable().optional(),
});

export type NotificationItem = z.infer<typeof notificationItemSchema>;

export const notificationListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    notifications: z.array(notificationItemSchema),
  }),
});
