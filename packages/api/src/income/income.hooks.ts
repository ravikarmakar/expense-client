import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApiClient } from '../client';

export interface Income {
  id: string;
  source: string;
  amount: number;
  category: string | null;
  paymentMethod?: string | null;
  date: string;
  notes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateIncomeInput {
  source: string;
  amount: number;
  category?: string;
  paymentMethod?: string;
  date: string;
  notes?: string;
}

export function useIncomes(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['income', params],
    queryFn: async () => {
      const { data } = await getApiClient().get<{
        data: { incomes: Income[]; nextCursor: string | null };
      }>('/income', { params });
      return data.data;
    },
  });
}

export function useIncome(id?: string) {
  return useQuery({
    queryKey: ['income', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await getApiClient().get<{ data: Income }>(`/income/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateIncomeInput) => {
      const { data } = await getApiClient().post<{ data: Income }>('/income', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export interface UpdateIncomeInput {
  id: string;
  source?: string;
  amount?: number;
  category?: string;
  paymentMethod?: string;
  date?: string;
  notes?: string;
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: UpdateIncomeInput) => {
      const { data } = await getApiClient().patch<{ data: Income }>(`/income/${id}`, rest);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await getApiClient().delete(`/income/${id}`);
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['income'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
