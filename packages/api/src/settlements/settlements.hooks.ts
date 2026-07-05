import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settleUpApi, getGroupSettlementsApi } from './settlements.api';
import { type SettleUpInput } from './settlements.types';
import type { Group } from '../groups/group.types';
import { groupKeys } from '../groups/group.hooks';

export const settlementKeys = {
  all: ['settlements'] as const,
  group: (groupId: string) => [...settlementKeys.all, 'group', groupId] as const,
};

export const useGroupSettlements = (groupId: string) =>
  useQuery({
    queryKey: settlementKeys.group(groupId),
    queryFn: () => getGroupSettlementsApi(groupId),
    enabled: !!groupId,
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
