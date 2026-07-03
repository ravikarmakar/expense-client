import { z } from 'zod';
import { EXPENSE_CATEGORIES, SPLIT_MODES } from './expense.types';

// ─────────────────────────────────────────────────────
// Client-side validation schemas
// ─────────────────────────────────────────────────────

export const clientCreateExpenseSchema = z.object({
  title: z
    .string()
    .min(1, 'Expense title is required')
    .max(100, 'Title must be at most 100 characters'),
  amount: z
    .number()
    .positive('Amount must be greater than 0')
    .max(1_000_000, 'Amount is too large'),
  category: z.enum(EXPENSE_CATEGORIES, 'Please select a category'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional(),
  groupId: z.string().optional(),
  useWallet: z.boolean().optional(),
  splitMemberIds: z
    .array(z.string())
    .min(1, 'Please select at least one member to split with')
    .optional(),
  splitMode: z.enum(SPLIT_MODES).nullable().optional(),
  splits: z
    .array(
      z.object({
        userId: z.string(),
        amount: z.number().min(0, 'Split amount cannot be negative'),
      })
    )
    .optional(),
});

export const clientUpdateExpenseSchema = z.object({
  title: z.string().min(1, 'Expense title is required').max(100).optional(),
  amount: z.number().positive('Amount must be greater than 0').optional(),
  category: z.enum(EXPENSE_CATEGORIES).optional(),
  date: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type ClientCreateExpenseInput = z.infer<typeof clientCreateExpenseSchema>;
export type ClientUpdateExpenseInput = z.infer<typeof clientUpdateExpenseSchema>;
