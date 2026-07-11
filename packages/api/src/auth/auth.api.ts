import { AxiosError } from 'axios';
import { z } from 'zod';
import { getApiClient } from '../client';
import {
  authResponseSchema,
  messageResponseSchema,
  userResponseSchema,
  changePasswordResponseSchema,
} from './auth.validation';
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
  ChangePasswordResponse,
} from './auth.types';

// ─────────────────────────────────────────────────────
// Helper: extracts a readable message from any error
// ─────────────────────────────────────────────────────

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (error instanceof z.ZodError) {
    return `Invalid response format: ${error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')}`;
  }
  if (error instanceof AxiosError) {
    // 1. Connection / Offline Issues
    if (error.code === 'ERR_NO_NETWORK' || !error.response) {
      if (error.message?.includes('internet') || error.code === 'ERR_NO_NETWORK') {
        return 'No internet connection. Please check your network and try again.';
      }
      if (error.code === 'ECONNABORTED') {
        return 'Connection timed out. The server is taking too long to respond.';
      }
      return 'Could not connect to the server. Please verify your connection.';
    }

    // 2. Server internal errors
    const status = error.response.status;
    if (status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }

    // 3. Request errors (400, 422, etc.)
    const data = error.response.data as { message?: string } | undefined;
    return data?.message ?? fallback;
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

export const meApi = async (signal?: AbortSignal): Promise<AuthUser> => {
  const { data } = await getApiClient().get<unknown>('/auth/me', { signal });
  const parsed = userResponseSchema.parse(data);
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

export const changePasswordApi = async (
  input: ChangePasswordInput
): Promise<ChangePasswordResponse> => {
  const { data } = await getApiClient().post<unknown>('/auth/change-password', input);
  return changePasswordResponseSchema.parse(data);
};

export const updateProfileApi = async (input: {
  name?: string;
  image?: string;
}): Promise<AuthUser> => {
  const { data } = await getApiClient().patch<unknown>('/users/me', input);
  const parsed = userResponseSchema.parse(data);
  return parsed.data.user;
};
