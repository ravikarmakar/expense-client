import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { settleUpApi, getGroupSettlementsApi } from './settlements.api';
import { type SettleUpInput } from './settlements.types';
import type { Group } from '../groups/group.types';
import { groupKeys } from '../groups/group.hooks';

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

export const useSettleUp = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, Omit<SettleUpInput, 'groupId'>>({
    mutationFn: (input) => settleUpApi({ groupId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detailConsolidated(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: settlementKeys.group(groupId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};
