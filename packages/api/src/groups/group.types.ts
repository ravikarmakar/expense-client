import { z } from 'zod';

// ─────────────────────────────────────────────────────
// Group member roles
// ─────────────────────────────────────────────────────

export const GROUP_MEMBER_ROLES = ['admin', 'member'] as const;
export type GroupMemberRole = (typeof GROUP_MEMBER_ROLES)[number];

// ─────────────────────────────────────────────────────
// Zod schemas
// ─────────────────────────────────────────────────────

export const groupMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable().optional(),
  role: z.enum(GROUP_MEMBER_ROLES).default('member'),
  joinedAt: z.string().optional(),
  balance: z.number().default(0), // positive = owed to this member, negative = owes
});

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  emoji: z.string().optional().default('👥'),
  members: z.array(groupMemberSchema),
  totalExpenses: z.number().default(0),
  myBalance: z.number().default(0), // net balance for the logged-in user in this group
  memberCount: z.number(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const groupListSchema = z.object({
  success: z.boolean(),
  data: z.object({
    groups: z.array(groupSchema),
  }),
});

export const groupDetailSchema = z.object({
  success: z.boolean(),
  data: z.object({
    group: groupSchema,
  }),
});

export const userSearchResultSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable().optional(),
});

export const userSearchListSchema = z.object({
  success: z.boolean(),
  data: z.object({
    users: z.array(userSearchResultSchema),
  }),
});

export const settleUpSchema = groupDetailSchema;

export const settlementSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  fromId: z.string(),
  toId: z.string(),
  amount: z.number(),
  from: z.object({
    userId: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  }),
  to: z.object({
    userId: z.string(),
    name: z.string(),
    image: z.string().nullable().optional(),
  }),
  createdAt: z.string(),
});

export const settlementListSchema = z.object({
  success: z.boolean(),
  data: z.object({
    settlements: z.array(settlementSchema),
    total: z.number(),
  }),
});

// ─────────────────────────────────────────────────────
// TypeScript types
// ─────────────────────────────────────────────────────

export type GroupMember = z.infer<typeof groupMemberSchema>;
export type Group = z.infer<typeof groupSchema>;
export type UserSearchResult = z.infer<typeof userSearchResultSchema>;
export type Settlement = z.infer<typeof settlementSchema>;

// ─────────────────────────────────────────────────────
// Input types for mutations
// ─────────────────────────────────────────────────────

export interface CreateGroupInput {
  name: string;
  description?: string;
  emoji?: string;
  memberEmails?: string[]; // invite on create
}

export interface UpdateGroupInput {
  id: string;
  name?: string;
  description?: string;
  emoji?: string;
}

export interface AddMemberInput {
  email: string;
}

export interface SettleUpInput {
  withUserId: string;
  amount: number;
}

// Constants
export const MAX_GROUP_MEMBERS = 20;
export const MIN_GROUP_MEMBERS = 2;
