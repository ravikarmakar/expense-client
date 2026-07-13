import { getApiClient } from '../client';
import {
  settleUpResponseSchema,
  settlementListSchema,
  type Settlement,
  type SettleUpInput,
} from './settlements.types';
import type { Group } from '../groups/group.types';

export const settleUpApi = async (input: SettleUpInput): Promise<Group> => {
  const { data } = await getApiClient().post<unknown>('/settlements', input);
  const parsed = settleUpResponseSchema.parse(data);
  return parsed.data.group;
};

export const getGroupSettlementsApi = async (
  groupId: string,
  cursor?: string
): Promise<{ settlements: Settlement[]; nextCursor: string | null }> => {
  const { data } = await getApiClient().get<unknown>(`/groups/${groupId}/settlements`, {
    params: { cursor },
  });
  const parsed = settlementListSchema.parse(data);
  return {
    settlements: parsed.data.settlements,
    nextCursor: parsed.data.nextCursor ?? null,
  };
};
