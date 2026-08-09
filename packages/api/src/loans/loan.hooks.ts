import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getApiClient } from '../client';
import type {
  Loan,
  LoanSummary,
  CreateLoanInput,
  UpdateLoanInput,
  AddLoanPaymentInput,
  GetLoansQueryParams,
} from './loan.types';

export function useLoans(params?: GetLoansQueryParams) {
  return useInfiniteQuery({
    queryKey: ['loans', params],
    queryFn: async ({ pageParam }) => {
      const { data } = await getApiClient().get<{
        data: { loans: Loan[]; nextCursor?: string; hasNextPage: boolean };
      }>('/loans', {
        params: {
          ...params,
          cursor: pageParam,
          limit: params?.limit || 20,
        },
      });
      return data.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextCursor : undefined),
  });
}

export function useLoanSummary() {
  return useQuery({
    queryKey: ['loans-summary'],
    queryFn: async () => {
      const { data } = await getApiClient().get<{ data: LoanSummary }>('/loans/summary');
      return data.data;
    },
  });
}

export function useLoanDetail(id?: string) {
  return useQuery({
    queryKey: ['loan-detail', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await getApiClient().get<{ data: Loan }>(`/loans/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateLoanInput) => {
      const { data } = await getApiClient().post<{ data: Loan }>('/loans', input);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: UpdateLoanInput) => {
      const { data } = await getApiClient().patch<{ data: Loan }>(`/loans/${id}`, rest);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans-summary'] });
      queryClient.invalidateQueries({ queryKey: ['loan-detail', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await getApiClient().delete<{ data: { success: boolean } }>(`/loans/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans-summary'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useRecordLoanPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ loanId, ...rest }: AddLoanPaymentInput) => {
      const { data } = await getApiClient().post<{ data: Loan }>(`/loans/${loanId}/payments`, rest);
      return data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loans-summary'] });
      queryClient.invalidateQueries({ queryKey: ['loan-detail', variables.loanId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSendLoanReminder() {
  return useMutation({
    mutationFn: async (loanId: string) => {
      const { data } = await getApiClient().post<{ data: { success: boolean; message: string } }>(
        `/loans/${loanId}/remind`
      );
      return data.data;
    },
  });
}
