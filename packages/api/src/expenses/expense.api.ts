import { getApiClient } from '../client';
import {
  expenseListSchema,
  expenseDetailSchema,
  expenseSummarySchema,
  type Expense,
  type CreateExpenseInput,
  type UpdateExpenseInput,
  type GetExpensesFilter,
  type ExpenseSummary,
} from './expense.types';

// ─────────────────────────────────────────────────────
// Expense API functions
// ─────────────────────────────────────────────────────

/**
 * Create a personal or group expense.
 */
export const createExpenseApi = async (input: CreateExpenseInput): Promise<Expense> => {
  const { data } = await getApiClient().post<unknown>('/expenses', input);
  const parsed = expenseDetailSchema.parse(data);
  return parsed.data.expense;
};

/**
 * Get list of expenses (personal + optionally filtered by group/category/date).
 */
export const getExpensesApi = async (
  filter?: GetExpensesFilter
): Promise<{ expenses: Expense[]; nextCursor: string | null }> => {
  const params = filter
    ? {
        ...filter,
        personal: filter.personal !== undefined ? String(filter.personal) : undefined,
      }
    : undefined;
  const { data } = await getApiClient().get<unknown>('/expenses', {
    params,
  });
  const parsed = expenseListSchema.parse(data);
  return {
    expenses: parsed.data.expenses,
    nextCursor: parsed.data.nextCursor ?? null,
  };
};

/**
 * Get a single expense by ID.
 */
export const getExpenseApi = async (id: string): Promise<Expense> => {
  const { data } = await getApiClient().get<unknown>(`/expenses/${id}`);
  const parsed = expenseDetailSchema.parse(data);
  return parsed.data.expense;
};

/**
 * Update an expense.
 */
export const updateExpenseApi = async ({ id, ...rest }: UpdateExpenseInput): Promise<Expense> => {
  const { data } = await getApiClient().patch<unknown>(`/expenses/${id}`, rest);
  const parsed = expenseDetailSchema.parse(data);
  return parsed.data.expense;
};

/**
 * Delete an expense.
 */
export const deleteExpenseApi = async (id: string): Promise<void> => {
  await getApiClient().delete(`/expenses/${id}`);
};

/**
 * Get expenses for a specific group (cursor paginated).
 */
export const getGroupExpensesApi = async (
  groupId: string,
  cursor?: string
): Promise<{ expenses: Expense[]; nextCursor: string | null }> => {
  const { data } = await getApiClient().get<unknown>(`/groups/${groupId}/expenses`, {
    params: { cursor },
  });
  const parsed = expenseListSchema.parse(data);
  return {
    expenses: parsed.data.expenses,
    nextCursor: parsed.data.nextCursor ?? null,
  };
};

/**
 * Add an expense directly to a group.
 */
export const createGroupExpenseApi = async (
  groupId: string,
  input: Omit<CreateExpenseInput, 'groupId'>
): Promise<Expense> => {
  const { data } = await getApiClient().post<unknown>(`/groups/${groupId}/expenses`, input);
  const parsed = expenseDetailSchema.parse(data);
  return parsed.data.expense;
};

export const getExpensesSummaryApi = async (): Promise<ExpenseSummary> => {
  const { data } = await getApiClient().get<unknown>('/expenses/summary');
  const parsed = expenseSummarySchema.parse(data);
  return parsed.data;
};
