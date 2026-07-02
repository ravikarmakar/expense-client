import { z } from 'zod';
import { MAX_GROUP_MEMBERS, GROUP_TYPES } from './group.types';

// ─────────────────────────────────────────────────────
// Client-side validation schemas for group forms
// ─────────────────────────────────────────────────────

export const clientCreateGroupSchema = z.object({
  name: z
    .string()
    .min(3, 'Group name must be at least 3 characters')
    .max(50, 'Group name must be at most 50 characters'),
  description: z.string().max(200, 'Description must be at most 200 characters').optional(),
  emoji: z.string().optional(),
  type: z.enum(GROUP_TYPES).optional().default('Other'),
  memberEmails: z
    .array(z.string().email())
    .max(MAX_GROUP_MEMBERS - 1, `You can add at most ${MAX_GROUP_MEMBERS - 1} other members`)
    .optional(),
});

export const clientAddMemberSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export const clientUpdateGroupSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(200).optional(),
  emoji: z.string().optional(),
  type: z.enum(GROUP_TYPES).optional(),
});

export type ClientCreateGroupInput = z.infer<typeof clientCreateGroupSchema>;
export type ClientAddMemberInput = z.infer<typeof clientAddMemberSchema>;
export type ClientUpdateGroupInput = z.infer<typeof clientUpdateGroupSchema>;
