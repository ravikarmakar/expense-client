import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  createGroupApi,
  getGroupsApi,
  getGroupApi,
  updateGroupApi,
  deactivateGroupApi,
  addMemberApi,
  removeMemberApi,
  searchUsersApi,
  searchUsersPaginatedApi,
  settleUpApi,
  leaveGroupApi,
  getGroupSettlementsApi,
  getGroupDetailApi,
} from './group.api';
import type {
  Group,
  CreateGroupInput,
  UpdateGroupInput,
  AddMemberInput,
  SettleUpInput,
} from './group.types';

// ─────────────────────────────────────────────────────
// Query key factory
// ─────────────────────────────────────────────────────

export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  list: () => [...groupKeys.lists()] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  detailConsolidated: (id: string) => [...groupKeys.detail(id), 'consolidated'] as const,
  search: (q: string) => ['users', 'search', q] as const,
  settlements: (groupId: string) => ['groups', groupId, 'settlements'] as const,
};

// ─────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────

/**
 * Fetch all groups the user belongs to.
 */
export const useGroups = () =>
  useInfiniteQuery({
    queryKey: groupKeys.list(),
    queryFn: ({ pageParam }) => getGroupsApi(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
  });

/**
 * Fetch a single group with members and recent expense summary.
 */
export const useGroup = (id: string) =>
  useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => getGroupApi(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });

/**
 * Fetch consolidated group details (metadata + recent expenses + recent settlements).
 */
export const useGroupDetail = (id: string) =>
  useQuery({
    queryKey: groupKeys.detailConsolidated(id),
    queryFn: () => getGroupDetailApi(id),
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  });

/**
 * Search for users to add as group members.
 * Only fires when query has at least 2 characters.
 */
export const useSearchUsers = (query: string) =>
  useQuery({
    queryKey: groupKeys.search(query),
    queryFn: () => searchUsersApi(query),
    enabled: query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 seconds
  });

/**
 * Paginated search for users to add as friends or group members.
 */
export const useSearchUsersPaginated = (query: string) =>
  useInfiniteQuery({
    queryKey: ['users', 'search', 'paginated', query],
    queryFn: ({ pageParam }) => searchUsersPaginatedApi(query, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: query.trim().length >= 2,
    staleTime: 10 * 1000,
  });

/**
 * Fetch settlements for a specific group.
 */
export const useGroupSettlements = (groupId: string) =>
  useQuery({
    queryKey: groupKeys.settlements(groupId),
    queryFn: () => getGroupSettlementsApi(groupId),
    enabled: !!groupId,
    staleTime: 3 * 60 * 1000,
  });

// ─────────────────────────────────────────────────────
// Mutations
// ─────────────────────────────────────────────────────

/**
 * Create a new group.
 */
export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, CreateGroupInput>({
    mutationFn: createGroupApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Update group details.
 */
export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, UpdateGroupInput>({
    mutationFn: updateGroupApi,
    onSuccess: (data) => {
      queryClient.setQueryData(groupKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: groupKeys.detailConsolidated(data.id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * Deactivate a group.
 */
export const useDeactivateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deactivateGroupApi,
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: groupKeys.detail(id) });
      queryClient.removeQueries({ queryKey: groupKeys.detailConsolidated(id) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Add a member to a group by email.
 */
export const useAddMember = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, AddMemberInput>({
    mutationFn: (input) => addMemberApi(groupId, input),
    onSuccess: (data) => {
      queryClient.setQueryData(groupKeys.detail(groupId), data);
      queryClient.invalidateQueries({ queryKey: groupKeys.detailConsolidated(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * Remove a member from a group.
 */
export const useRemoveMember = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, string>({
    mutationFn: (memberId) => removeMemberApi(groupId, memberId),
    onSuccess: (data) => {
      queryClient.setQueryData(groupKeys.detail(groupId), data);
      queryClient.invalidateQueries({ queryKey: groupKeys.detailConsolidated(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * Settle up with a member in a group.
 */
export const useSettleUp = (groupId: string) => {
  const queryClient = useQueryClient();
  return useMutation<Group, Error, SettleUpInput>({
    mutationFn: (input) => settleUpApi(groupId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.detailConsolidated(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: groupKeys.settlements(groupId) });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
    },
  });
};

/**
 * Leave a group (current user removes themselves).
 */
export const useLeaveGroup = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: leaveGroupApi,
    onSuccess: (_, groupId) => {
      queryClient.removeQueries({ queryKey: groupKeys.detail(groupId) });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};
