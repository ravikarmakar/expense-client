import { useMutation, useQueryClient, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { settleUpApi, getGroupSettlementsApi, deleteSettlementApi } from './settlements.api';
import { type SettleUpInput, type Settlement } from './settlements.types';
import type { Group } from '../groups/group.types';
import { groupKeys } from '../groups/group.hooks';
import { getApiClient } from '../client';

export const settlementKeys = {
  all: ['settlements'] as const,
  group: (groupId: string) => [...settlementKeys.all, 'group', groupId] as const,
};

export const useGroupSettlements = (groupId: string, options?: { enabled?: boolean }) =>
  useInfiniteQuery({
    queryKey: settlementKeys.group(groupId),
    queryFn: ({ pageParam }) => getGroupSettlementsApi(groupId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!groupId && (options?.enabled ?? true),
    staleTime: 3 * 60 * 1000,
  });

export const useSettlements = (params?: { groupId?: string }) =>
  useQuery({
    queryKey: ['settlements', params],
    queryFn: async () => {
      const { data } = await getApiClient().get<{
        data: { settlements: Settlement[]; total: number };
      }>('/settlements', { params });
      return data.data;
    },
  });

export const useSettleUp = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation<
    { group?: Group; settlement?: Settlement },
    Error,
    Omit<SettleUpInput, 'groupId'>
  >({
    mutationFn: (input) => settleUpApi({ groupId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detailConsolidated(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: settlementKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};

export const useDeleteSettlement = (groupId?: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>({
    mutationFn: (settlementId) => deleteSettlementApi(settlementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.all });
      if (groupId) {
        queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
        queryClient.invalidateQueries({ queryKey: groupKeys.detailConsolidated(groupId) });
        queryClient.invalidateQueries({ queryKey: settlementKeys.group(groupId) });
      }
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['settlements'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
};
