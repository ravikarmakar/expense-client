import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  PASSWORD_LOWERCASE_REGEX,
  PASSWORD_UPPERCASE_REGEX,
  PASSWORD_NUMBER_REGEX,
  PASSWORD_SPECIAL_CHAR_REGEX,
} from '@workspace/types';

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(PASSWORD_LOWERCASE_REGEX, 'Password must contain at least one lowercase letter')
  .regex(PASSWORD_UPPERCASE_REGEX, 'Password must contain at least one uppercase letter')
  .regex(PASSWORD_NUMBER_REGEX, 'Password must contain at least one number')
  .regex(PASSWORD_SPECIAL_CHAR_REGEX, 'Password must contain at least one special character');

// ─────────────────────────────────────────────────────
// Input Schemas (to validate client inputs before API calls)
// ─────────────────────────────────────────────────────

export const clientRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const clientLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const clientForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const clientVerifyEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z
    .string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
});

export const clientResendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ─────────────────────────────────────────────────────
// Response Payload Schemas (to validate response payloads after API calls)
// ─────────────────────────────────────────────────────

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.preprocess(
    (val) => (typeof val === 'string' ? val.toUpperCase() : val),
    z.enum(['USER', 'ADMIN'])
  ),
  emailVerified: z.boolean(),
  image: z.string().nullable().optional(),
});

export const authSessionSchema = z.object({
  id: z.string(),
  expiresAt: z.string(),
});

export const authResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: authUserSchema,
    session: authSessionSchema.optional(),
    token: z.string().optional(),
    requiresVerification: z.boolean().optional(),
  }),
});

export const userResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    user: authUserSchema,
  }),
});

export const clientResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z
    .string()
    .length(6, 'Reset code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
  newPassword: passwordSchema,
});

export const clientVerifyResetCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z
    .string()
    .length(6, 'Reset code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
});

export const messageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const changePasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z
    .object({
      token: z.string().nullable().optional(),
    })
    .optional(),
});

export const clientVerifyPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const clientChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });
