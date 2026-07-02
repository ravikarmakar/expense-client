import { AxiosError } from 'axios';
import { z } from 'zod';
import { getApiClient } from '../client';
import { authResponseSchema, messageResponseSchema, authUserSchema } from './auth.validation';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  MessageResponse,
  AuthUser,
  VerifyEmailInput,
  ResendVerificationInput,
  VerifyResetCodeInput,
  VerifyPasswordInput,
  ChangePasswordInput,
} from './auth.types';

// ─────────────────────────────────────────────────────
// Helper: extracts a readable message from any error
// ─────────────────────────────────────────────────────

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (error instanceof z.ZodError) {
    return `Invalid response format: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
  }
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

// ─────────────────────────────────────────────────────
// Auth API functions — pure async, validated with Zod
// ─────────────────────────────────────────────────────

export const loginApi = async (input: LoginInput): Promise<AuthResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/login', input);
  return authResponseSchema.parse(data);
};

export const registerApi = async (input: RegisterInput): Promise<AuthResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/register', input);
  return authResponseSchema.parse(data);
};

export const logoutApi = async (): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/logout');
  return messageResponseSchema.parse(data);
};

export const forgotPasswordApi = async (input: ForgotPasswordInput): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/forgot-password', input);
  return messageResponseSchema.parse(data);
};

export const verifyResetCodeApi = async (input: VerifyResetCodeInput): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/verify-reset-code', input);
  return messageResponseSchema.parse(data);
};

export const resetPasswordApi = async (input: ResetPasswordInput): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/reset-password', input);
  return messageResponseSchema.parse(data);
};

export const meApi = async (): Promise<AuthUser> => {
  const { data } = await getApiClient().get<unknown>('/auth/me');
  const parsed = z
    .object({
      success: z.boolean(),
      data: z.object({
        user: authUserSchema,
      }),
    })
    .parse(data);
  return parsed.data.user;
};

export const verifyEmailApi = async (input: VerifyEmailInput): Promise<AuthResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/verify-email', input);
  return authResponseSchema.parse(data);
};

export const resendVerificationApi = async (
  input: ResendVerificationInput
): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/resend-verification', input);
  return messageResponseSchema.parse(data);
};

export const verifyPasswordApi = async (input: VerifyPasswordInput): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/verify-password', input);
  return messageResponseSchema.parse(data);
};

export const changePasswordApi = async (input: ChangePasswordInput): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/change-password', input);
  return messageResponseSchema.parse(data);
};

export const updateProfileApi = async (input: {
  name?: string;
  image?: string;
}): Promise<AuthUser> => {
  const { data } = await getApiClient().patch<unknown>('/users/me', input);
  const parsed = z
    .object({
      success: z.boolean(),
      data: z.object({
        user: authUserSchema,
      }),
    })
    .parse(data);
  return parsed.data.user;
};
