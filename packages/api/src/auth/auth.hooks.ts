import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { getStorage, TOKEN_KEY } from '../client';
import {
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  meApi,
  verifyEmailApi,
  resendVerificationApi,
  verifyResetCodeApi,
  verifyPasswordApi,
  changePasswordApi,
} from './auth.api';
import type {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  AuthResponse,
  MessageResponse,
  VerifyEmailInput,
  ResendVerificationInput,
  VerifyResetCodeInput,
  VerifyPasswordInput,
  ChangePasswordInput,
} from './auth.types';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, LoginInput>({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      // Token is absent when the server asks for email verification first
      if (data.data.token) {
        await getStorage().setItem(TOKEN_KEY, data.data.token);
      }
      // Seed the "me" cache so the app doesn't need a second request
      queryClient.setQueryData(authKeys.me, data.data.user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, RegisterInput>({
    mutationFn: registerApi,
    onSuccess: async (data) => {
      // Token is only issued after email verification — nothing to store yet.
      // Seed the "me" cache with the unverified user so OTP screen can read the email.
      queryClient.setQueryData(authKeys.me, data.data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutApi,
    onSettled: async () => {
      // Always clear local state even if the server call fails
      await getStorage().removeItem(TOKEN_KEY);
      queryClient.setQueryData(authKeys.me, null);
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });
    },
  });
};

export const useForgotPassword = () =>
  useMutation<{ success: boolean; message: string }, Error, ForgotPasswordInput>({
    mutationFn: forgotPasswordApi,
  });

export const useVerifyResetCode = () =>
  useMutation<{ success: boolean; message: string }, Error, VerifyResetCodeInput>({
    mutationFn: verifyResetCodeApi,
  });

export const useResetPassword = () =>
  useMutation<{ success: boolean; message: string }, Error, ResetPasswordInput>({
    mutationFn: resetPasswordApi,
  });

export const useMe = () =>
  useQuery({
    queryKey: authKeys.me,
    queryFn: async () => {
      const storage = getStorage();
      const token = await storage.getItem(TOKEN_KEY);
      if (!token) return null;
      try {
        return await meApi();
      } catch (error) {
        // If the token was cleared (e.g. by 401 response interceptor), return null.
        // Otherwise (e.g. offline/network issue), throw so the query state remains error.
        const tokenCheck = await storage.getItem(TOKEN_KEY);
        if (!tokenCheck) return null;
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError && error.response?.status === 401) return false;
      return failureCount < 2;
    },
  });

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, VerifyEmailInput>({
    mutationFn: verifyEmailApi,
    onSuccess: async (data) => {
      if (data.data.token) {
        await getStorage().setItem(TOKEN_KEY, data.data.token);
      }
      queryClient.setQueryData(authKeys.me, data.data.user);
    },
  });
};

export const useResendVerification = () =>
  useMutation<MessageResponse, Error, ResendVerificationInput>({
    mutationFn: resendVerificationApi,
  });

export const useVerifyPassword = () =>
  useMutation<MessageResponse, Error, VerifyPasswordInput>({
    mutationFn: verifyPasswordApi,
  });

export const useChangePassword = () =>
  useMutation<MessageResponse, Error, ChangePasswordInput>({
    mutationFn: changePasswordApi,
  });
