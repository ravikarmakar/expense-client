import { AxiosError } from 'axios';
import { getApiClient } from '../client';
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  MessageResponse,
  AuthUser,
} from './auth.types';

// ─────────────────────────────────────────────────────
// Helper: extracts a readable message from any error
// ─────────────────────────────────────────────────────

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

// ─────────────────────────────────────────────────────
// Auth API functions — pure async, no React hooks
// ─────────────────────────────────────────────────────

export const loginApi = async (input: LoginInput): Promise<AuthResponse> => {
  const { data } = await getApiClient().post<AuthResponse>('/auth/login', input);
  return data;
};

export const registerApi = async (input: RegisterInput): Promise<AuthResponse> => {
  const { data } = await getApiClient().post<AuthResponse>('/auth/register', input);
  return data;
};

export const logoutApi = async (): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<MessageResponse>('/auth/logout');
  return data;
};

export const forgotPasswordApi = async (input: ForgotPasswordInput): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<MessageResponse>('/auth/forgot-password', input);
  return data;
};

export const resetPasswordApi = async (input: ResetPasswordInput): Promise<MessageResponse> => {
  const { data } = await getApiClient().post<MessageResponse>('/auth/reset-password', input);
  return data;
};

export const meApi = async (): Promise<AuthUser> => {
  const { data } = await getApiClient().get<{ success: boolean; data: { user: AuthUser } }>(
    '/auth/me'
  );
  return data.data.user;
};
