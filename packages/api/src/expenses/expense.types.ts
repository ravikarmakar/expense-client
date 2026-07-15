import { z } from 'zod';

// ─────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
  'Food',
  'Transport',
  'Shopping',
  'Entertainment',
  'Bills',
  'Health',
  'Travel',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const SPLIT_MODES = ['equal', 'exact', 'percentage'] as const;
export type SplitMode = (typeof SPLIT_MODES)[number];

// ─────────────────────────────────────────────────────
// Zod schemas — matching backend response shapes
// ─────────────────────────────────────────────────────

export const expenseSplitSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullable().optional(),
  amount: z.number(),
  paid: z.boolean().default(false),
});

export const expenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  groupId: z.string().nullable().optional(),
  title: z.string(),
  amount: z.number(),
  category: z.preprocess((val) => {
    if (typeof val === 'string') {
      const match = EXPENSE_CATEGORIES.find((c) => c.toLowerCase() === val.toLowerCase());
      return match || 'Other';
    }
    return 'Other';
  }, z.enum(EXPENSE_CATEGORIES)),
  date: z.string(), // ISO date string
  notes: z.string().nullable().optional(),
  paidBy: z.object({
    userId: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  }),
  splits: z.array(expenseSplitSchema).optional().default([]),
  splitMode: z.preprocess((val) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if ((SPLIT_MODES as readonly string[]).includes(lower)) return lower;
    }
    return val;
  }, z.enum(SPLIT_MODES).nullable().optional()),
  myShare: z.number().nullable().optional(),
  youOwe: z.number().nullable().optional(), // positive = you owe, negative = owed to you
  isWalletPayment: z.boolean().optional(),
  group: z
    .object({
      name: z.string(),
      emoji: z.string(),
    })
    .nullable()
    .optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isSettled: z.boolean().optional(),
});

export const expenseListSchema = z.object({
  success: z.boolean(),
  data: z.object({
    expenses: z.array(expenseSchema),
    total: z.number().optional(),
    page: z.number().optional(),
    nextCursor: z.string().nullable().optional(),
  }),
});

export const expenseDetailSchema = z.object({
  success: z.boolean(),
  data: z.object({
    expense: expenseSchema,
  }),
});

export const expenseSummarySchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalSpent: z.number(),
    totalGroupSpent: z.number(),
    totalPersonalSpent: z.number(),
  }),
});

// ─────────────────────────────────────────────────────
// TypeScript types (inferred from Zod)
// ─────────────────────────────────────────────────────

export type ExpenseSplit = z.infer<typeof expenseSplitSchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type ExpenseListResponse = z.infer<typeof expenseListSchema>;
export type ExpenseSummary = z.infer<typeof expenseSummarySchema>['data'];

// ─────────────────────────────────────────────────────
// Input types for mutations
// ─────────────────────────────────────────────────────

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  groupId?: string;
  useWallet?: boolean;
  splitMemberIds?: string[];
  splitMode?: SplitMode | null;
  splits?: { userId: string; amount: number }[];
}

export interface UpdateExpenseInput {
  id: string;
  title?: string;
  amount?: number;
  category?: ExpenseCategory;
  date?: string;
  notes?: string;
}

export interface GetExpensesFilter {
  category?: ExpenseCategory | 'All';
  groupId?: string;
  startDate?: string;
  endDate?: string;
  paidByMe?: boolean;
  useWallet?: boolean;
  page?: number;
  limit?: number;
  cursor?: string;
  personal?: boolean;
  search?: string;
}
