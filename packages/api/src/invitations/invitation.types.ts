import { z } from 'zod';

export const invitationSchema = z.object({
  id: z.string(),
  type: z.enum(['GROUP', 'FRIEND', 'EXPENSE', 'WORKSPACE', 'ORGANIZATION']),
  status: z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED']),
  title: z.string(),
  message: z.string().optional().nullable(),
  senderId: z.string(),
  senderName: z.string(),
  receiverId: z.string(),
  targetId: z.string().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  respondedAt: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Invitation = z.infer<typeof invitationSchema>;

export const invitationListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    invitations: z.array(invitationSchema),
  }),
});
