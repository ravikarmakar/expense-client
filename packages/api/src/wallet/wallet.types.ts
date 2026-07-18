import { z } from 'zod';

export const walletTransactionSchema = z.object({
  id: z.string(),
  walletId: z.string(),
  amount: z.number().nullable(),
  type: z.enum(['DEPOSIT', 'EXPENSE', 'MANAGER_CHANGE', 'TARGET_CHANGE']),
  description: z.string().nullable(),
  userId: z.string().nullable(),
  expenseId: z.string().nullable(),
  createdAt: z.string(),
  user: z
    .object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
    })
    .nullable()
    .optional(),
});

export const walletContributionSchema = z.object({
  id: z.string(),
  walletId: z.string(),
  userId: z.string(),
  amount: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
  }),
});

export const walletSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  walletManagerId: z.string(),
  balance: z.number(),
  targetContribution: z.number(),
  targetExpiresAt: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  manager: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    image: z.string().nullable(),
  }),
  transactions: z.array(walletTransactionSchema).optional().default([]),
  contributions: z.array(walletContributionSchema).optional().default([]),
});

export type Wallet = z.infer<typeof walletSchema>;
export type WalletTransaction = z.infer<typeof walletTransactionSchema>;
export type WalletContribution = z.infer<typeof walletContributionSchema>;

export const setupWalletInputSchema = z.object({
  walletManagerId: z.string(),
  targetContribution: z.number().min(0),
  durationDays: z.number().optional(),
  expiresAt: z.string().optional(),
});
export type SetupWalletInput = z.infer<typeof setupWalletInputSchema>;

export const updateManagerInputSchema = z.object({
  walletManagerId: z.string(),
});
export type UpdateManagerInput = z.infer<typeof updateManagerInputSchema>;

export const updateTargetInputSchema = z.object({
  targetContribution: z.number().min(0),
  durationDays: z.number().optional(),
  expiresAt: z.string().optional(),
});
export type UpdateTargetInput = z.infer<typeof updateTargetInputSchema>;

export const contributeInputSchema = z.object({
  amount: z.number().min(0.01),
});
export type ContributeInput = z.infer<typeof contributeInputSchema>;
