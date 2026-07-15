import { z } from 'zod';
import { groupSchema } from '../groups/group.types';

export const settlementSchema = z.object({
  id: z.string(),
  groupId: z.string().nullable(), // Nullable for direct P2P settlements
  fromId: z.string().nullable(),
  toId: z.string().nullable(),
  amount: z.number(),
  from: z.object({
    userId: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  }),
  to: z.object({
    userId: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  }),
  note: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const settlementListSchema = z.object({
  success: z.boolean(),
  data: z.object({
    settlements: z.array(settlementSchema),
    total: z.number().optional(),
    nextCursor: z.string().nullable().optional(),
  }),
});

export const settleUpResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    group: z.lazy(() => groupSchema).optional(), // Optional since P2P settlements don't have a group
    settlement: settlementSchema.optional(), // Optional for P2P response payload
  }),
});

export type Settlement = z.infer<typeof settlementSchema>;
export type SettlementList = z.infer<typeof settlementListSchema>;
export type SettleUpResponse = z.infer<typeof settleUpResponseSchema>;

export interface SettleUpInput {
  groupId?: string; // Optional for P2P settlements
  withUserId: string;
  amount: number;
  fromId?: string; // Optional direction specification for P2P
  toId?: string; // Optional direction specification for P2P
}
