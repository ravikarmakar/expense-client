import { getApiClient } from '../client';
import { messageResponseSchema } from '../auth/auth.validation';
import {
  groupListSchema,
  groupDetailSchema,
  userSearchListSchema,
  groupDetailConsolidatedSchema,
  type Group,
  type UserSearchResult,
  type CreateGroupInput,
  type UpdateGroupInput,
  type AddMemberInput,
  type GroupDetailConsolidated,
} from './group.types';

/**
 * Get consolidated group details (includes group metadata, members list, expenses, and settlements).
 */
export const getGroupDetailApi = async (id: string): Promise<GroupDetailConsolidated['data']> => {
  const { data } = await getApiClient().get<unknown>(`/groups/${id}/detail`);
  const parsed = groupDetailConsolidatedSchema.parse(data);
  return parsed.data;
};

// ─────────────────────────────────────────────────────
// Group API functions
// ─────────────────────────────────────────────────────

/**
 * Create a new group (optionally with members).
 */
export const createGroupApi = async (input: CreateGroupInput): Promise<Group> => {
  const { data } = await getApiClient().post<unknown>('/groups', input);
  const parsed = groupDetailSchema.parse(data);
  return parsed.data.group;
};

/**
 * Get all groups the current user belongs to.
 */
export const getGroupsApi = async (
  cursor?: string
): Promise<{ groups: Group[]; nextCursor: string | null }> => {
  const { data } = await getApiClient().get<unknown>('/groups', {
    params: { cursor },
  });
  const parsed = groupListSchema.parse(data);
  return {
    groups: parsed.data.groups,
    nextCursor: parsed.data.nextCursor ?? null,
  };
};

/**
 * Get a single group by ID (includes members and recent expenses).
 */
export const getGroupApi = async (id: string): Promise<Group> => {
  const { data } = await getApiClient().get<unknown>(`/groups/${id}`);
  const parsed = groupDetailSchema.parse(data);
  return parsed.data.group;
};

/**
 * Update group info (name, description, emoji).
 */
export const updateGroupApi = async ({ id, ...rest }: UpdateGroupInput): Promise<Group> => {
  const { data } = await getApiClient().patch<unknown>(`/groups/${id}`, rest);
  const parsed = groupDetailSchema.parse(data);
  return parsed.data.group;
};

/**
 * Deactivate a group (only admin can do this).
 */
export const deactivateGroupApi = async (id: string): Promise<void> => {
  await getApiClient().patch(`/groups/${id}/deactivate`);
};

/**
 * Add a member to a group by email.
 */
export const addMemberApi = async (groupId: string, input: AddMemberInput): Promise<Group> => {
  const { data } = await getApiClient().post<unknown>(`/groups/${groupId}/members`, input);
  const parsed = groupDetailSchema.parse(data);
  return parsed.data.group;
};

/**
 * Remove a member from a group.
 */
export const removeMemberApi = async (groupId: string, memberId: string): Promise<Group> => {
  const { data } = await getApiClient().delete<unknown>(`/groups/${groupId}/members/${memberId}`);
  const parsed = groupDetailSchema.parse(data);
  return parsed.data.group;
};

/**
 * Search users by name or email (to add as members).
 */
export const searchUsersApi = async (query: string): Promise<UserSearchResult[]> => {
  if (!query || query.trim().length < 2) return [];
  const { data } = await getApiClient().get<unknown>('/users/search', {
    params: { q: query.trim() },
  });
  const parsed = userSearchListSchema.parse(data);
  return parsed.data.users;
};

export interface PaginatedUsersResult {
  users: UserSearchResult[];
  nextCursor: string | null;
}

export const searchUsersPaginatedApi = async (
  query: string,
  cursor?: string
): Promise<PaginatedUsersResult> => {
  if (!query || query.trim().length < 2) {
    return { users: [], nextCursor: null };
  }
  const { data } = await getApiClient().get<unknown>('/users/search', {
    params: { q: query.trim(), cursor },
  });
  const parsed = userSearchListSchema.parse(data);
  return {
    users: parsed.data.users,
    nextCursor: parsed.data.nextCursor ?? null,
  };
};

/**
 * Leave a group (current user exits).
 */
export const leaveGroupApi = async (groupId: string): Promise<void> => {
  const { data } = await getApiClient().delete<unknown>(`/groups/${groupId}/leave`);
  messageResponseSchema.parse(data);
};

/**
 * Send settle up reminder notification to a debtor in the group.
 */
export const sendReminderApi = async (groupId: string, userId: string): Promise<void> => {
  const { data } = await getApiClient().post<unknown>(`/groups/${groupId}/remind`, { userId });
  messageResponseSchema.parse(data);
};
