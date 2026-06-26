import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getStorage, TOKEN_KEY } from '../client';
import {
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  meApi,
} from './auth.api';
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  AuthResponse,
} from './auth.types';

// ─────────────────────────────────────────────────────
// Query keys — centralised to avoid typos
// ─────────────────────────────────────────────────────

export const authKeys = {
  me: ['auth', 'me'] as const,
};

// ─────────────────────────────────────────────────────
// useLogin
// ─────────────────────────────────────────────────────

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      // Persist the JWT token using the platform storage adapter
      await getStorage().setItem(TOKEN_KEY, data.data.token);
      // Seed the "me" cache so the app doesn't need a second request
      queryClient.setQueryData(authKeys.me, data.data.user);
    },
  });
};

// ─────────────────────────────────────────────────────
// useRegister
// ─────────────────────────────────────────────────────

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: registerApi,
    onSuccess: async (data) => {
      await getStorage().setItem(TOKEN_KEY, data.data.token);
      queryClient.setQueryData(authKeys.me, data.data.user);
    },
  });
};

// ─────────────────────────────────────────────────────
// useLogout
// ─────────────────────────────────────────────────────

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutApi,
    onSettled: async () => {
      // Always clear local state even if the server call fails
      await getStorage().removeItem(TOKEN_KEY);
      queryClient.clear();
    },
  });
};

// ─────────────────────────────────────────────────────
// useForgotPassword
// ─────────────────────────────────────────────────────

export const useForgotPassword = () =>
  useMutation<{ success: boolean; message: string }, Error, ForgotPasswordInput>({
    mutationFn: forgotPasswordApi,
  });

// ─────────────────────────────────────────────────────
// useResetPassword
// ─────────────────────────────────────────────────────

export const useResetPassword = () =>
  useMutation<{ success: boolean; message: string }, Error, ResetPasswordInput>({
    mutationFn: resetPasswordApi,
  });

// ─────────────────────────────────────────────────────
// useMe — fetch current user, enabled only when a
// token is already present in storage
// ─────────────────────────────────────────────────────

export const useMe = (hasToken: boolean) =>
  useQuery({
    queryKey: authKeys.me,
    queryFn: meApi,
    enabled: hasToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
