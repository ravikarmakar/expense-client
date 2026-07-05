import { z } from 'zod';
import { expenseSchema } from '../expenses/expense.types';
import { settlementSchema, type Settlement } from '../settlements/settlements.types';

// ─────────────────────────────────────────────────────
// Group member roles
// ─────────────────────────────────────────────────────

export const GROUP_MEMBER_ROLES = ['admin', 'member', 'invited'] as const;
export type GroupMemberRole = (typeof GROUP_MEMBER_ROLES)[number];

export const GROUP_TYPES = [
  'Roommates',
  'Travel',
  'Friends',
  'Family',
  'Office',
  'Event',
  'Couple',
  'Study',
  'Food / Mess',
  'Gaming',
  'Other',
] as const;
export type GroupType = (typeof GROUP_TYPES)[number];

export const groupMemberSchema = z.object({
  userId: z.string(),
  name: z.string(),
  email: z.string().email(),
  image: z.string().nullable().optional(),
  role: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        const lower = val.toLowerCase();
        if ((GROUP_MEMBER_ROLES as readonly string[]).includes(lower)) return lower;
      }
      return 'member';
    }, z.enum(GROUP_MEMBER_ROLES))
    .default('member'),
  joinedAt: z.string().optional(),
  balance: z.number().default(0), // positive = owed to this member, negative = owes
});

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  emoji: z.string().optional().default('👥'),
  type: z
    .preprocess((val) => {
      if (typeof val === 'string') {
        const match = GROUP_TYPES.find((t) => t.toLowerCase() === val.toLowerCase());
        return match || 'Other';
      }
      return 'Other';
    }, z.enum(GROUP_TYPES))
    .default('Other'),
  members: z.array(groupMemberSchema),
  invitedEmails: z.array(z.string()).optional(),
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
    nextCursor: z.string().nullable().optional(),
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
    nextCursor: z.string().nullable().optional(),
  }),
});

export const groupDetailConsolidatedSchema = z.object({
  success: z.boolean(),
  data: z.object({
    group: groupSchema,
    expenses: z.array(expenseSchema),
    settlements: z.array(settlementSchema),
  }),
});

// ─────────────────────────────────────────────────────
// TypeScript types
// ─────────────────────────────────────────────────────

export type GroupMember = z.infer<typeof groupMemberSchema>;
export type Group = z.infer<typeof groupSchema>;
export type UserSearchResult = z.infer<typeof userSearchResultSchema>;
export { type Settlement };
export type GroupDetailConsolidated = z.infer<typeof groupDetailConsolidatedSchema>;

// ─────────────────────────────────────────────────────
// Input types for mutations
// ─────────────────────────────────────────────────────

export interface CreateGroupInput {
  name: string;
  description?: string;
  emoji?: string;
  type?: GroupType;
  memberEmails?: string[]; // invite on create
}

export interface UpdateGroupInput {
  id: string;
  name?: string;
  description?: string;
  emoji?: string;
  type?: GroupType;
}

export interface AddMemberInput {
  email: string;
}

// Constants
export const MAX_GROUP_MEMBERS = 20;
export const MIN_GROUP_MEMBERS = 2;
