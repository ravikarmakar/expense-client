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
  updateProfileApi,
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
  ChangePasswordResponse,
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
        // Clear any recorded pending verification
        await getStorage().removeItem('pending_verification_email');
      } else if (data.data.requiresVerification && data.data.user?.email) {
        // Record the email that requires verification
        await getStorage().setItem('pending_verification_email', data.data.user.email);
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

      // Store the pending verification email so the app can guide the user back if closed
      if (data.data.user?.email) {
        await getStorage().setItem('pending_verification_email', data.data.user.email);
      }
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logoutApi,
    onSettled: async () => {
      // Always clear local state even if the server call fails
      // 1. Remove the token first to prevent any concurrent background queries from utilizing it
      await getStorage().removeItem(TOKEN_KEY);

      // 2. Clear any recorded pending verification
      await getStorage().removeItem('pending_verification_email');

      // 3. Cancel in-flight queries and remove other query caches to prevent trailing requests
      await queryClient.cancelQueries();
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'auth',
      });

      // 4. Set the current user to null last to trigger state changes/navigation redirects
      queryClient.setQueryData(authKeys.me, null);
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
    queryFn: async ({ signal }) => {
      const storage = getStorage();
      const token = await storage.getItem(TOKEN_KEY);
      if (!token) return null;
      try {
        return await meApi(signal);
      } catch (error) {
        // If the query failed with a 401 Unauthorized error, it means the interceptor
        // has already cleared the token and logged the user out. Return null to transition
        // the query state to authenticated: false cleanly without throwing.
        if (error instanceof AxiosError && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    // staleTime: 10 minutes. This is intentionally longer than the global default
    // of 5 minutes because the current user profile is relatively static, preventing
    // excessive /auth/me checks on every component mount or AppState refocus.
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000, // 30 minutes (keep cache alive during backgrounding)
    retry: (failureCount, error: unknown) => {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        if (status === 401 || status === 403 || (status && status >= 500)) return false;
      }
      return failureCount < 1;
    },
  });

export const useVerifyEmail = () => {
  const queryClient = useQueryClient();
  return useMutation<AuthResponse, Error, VerifyEmailInput>({
    mutationFn: verifyEmailApi,
    onSuccess: async (data) => {
      if (data.data.token) {
        await getStorage().setItem(TOKEN_KEY, data.data.token);
        // Clear pending verification email
        await getStorage().removeItem('pending_verification_email');
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

export const useChangePassword = () => {
  return useMutation<ChangePasswordResponse, Error, ChangePasswordInput>({
    mutationFn: changePasswordApi,
    onSuccess: async (data) => {
      if (data.data?.token) {
        await getStorage().setItem(TOKEN_KEY, data.data.token);
      }
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.me, data);
      queryClient.invalidateQueries();
    },
  });
};
