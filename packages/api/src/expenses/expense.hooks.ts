import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  createExpenseApi,
  getExpensesApi,
  getExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
  getGroupExpensesApi,
  createGroupExpenseApi,
  getExpensesSummaryApi,
} from './expense.api';
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  GetExpensesFilter,
} from './expense.types';

// ─────────────────────────────────────────────────────
// Query key factory — keeps cache keys consistent
// ─────────────────────────────────────────────────────

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (filter?: GetExpensesFilter) => [...expenseKeys.lists(), { filter }] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
  summary: () => [...expenseKeys.all, 'summary'] as const,
  groupExpenses: (groupId: string) => ['groups', groupId, 'expenses'] as const,
};

// ─────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────

/**
 * Fetch paginated list of expenses with optional filters.
 */
export const useExpenses = (filter?: GetExpensesFilter) =>
  useInfiniteQuery({
    queryKey: expenseKeys.list(filter),
    queryFn: ({ pageParam }) =>
      getExpensesApi({ ...filter, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

/**
 * Fetch a single expense by ID.
 */
export const useExpense = (id: string) =>
  useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => getExpenseApi(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });

/**
 * Fetch the user's expenses summary (total spent, personal, group).
 */
export const useExpensesSummary = () =>
  useQuery({
    queryKey: expenseKeys.summary(),
    queryFn: getExpensesSummaryApi,
    staleTime: 60 * 1000,
  });

/**
 * Fetch expenses for a specific group (paginated).
 */
export const useGroupExpenses = (groupId: string) =>
  useInfiniteQuery({
    queryKey: expenseKeys.groupExpenses(groupId),
    queryFn: ({ pageParam }) => getGroupExpensesApi(groupId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 3 * 60 * 1000,
    enabled: !!groupId,
  });

// ─────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────

/**
 * Create a new personal expense. Invalidates expense list on success.
 */
export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, CreateExpenseInput>({
    mutationFn: createExpenseApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Create an expense directly within a group.
 */
export const useCreateGroupExpense = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, Omit<CreateExpenseInput, 'groupId'>>({
    mutationFn: (input) => createGroupExpenseApi(groupId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Update an existing expense.
 */
export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation<Expense, Error, UpdateExpenseInput>({
    mutationFn: updateExpenseApi,
    onSuccess: (data) => {
      queryClient.setQueryData(expenseKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Delete an expense with optimistic removal from cache.
 */
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteExpenseApi,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: expenseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
