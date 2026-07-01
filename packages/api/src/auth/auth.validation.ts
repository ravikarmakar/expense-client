import { z } from 'zod';

// ─────────────────────────────────────────────────────
// Input Schemas (to validate client inputs before API calls)
// ─────────────────────────────────────────────────────

export const clientRegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
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
  role: z.enum(['USER', 'ADMIN']),
  emailVerified: z.boolean().optional(),
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

export const clientResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z
    .string()
    .length(6, 'Reset code must be 6 digits')
    .regex(/^\d{6}$/, 'Code must be numeric'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
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

export const clientVerifyPasswordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const clientChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
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
