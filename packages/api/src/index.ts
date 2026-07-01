// ─────────────────────────────────────────────────────
// @workspace/api — barrel export
// ─────────────────────────────────────────────────────

// Client setup
export { createApiClient, getApiClient, getStorage, onAuthError, TOKEN_KEY } from './client';

// QueryClient factory
export { createQueryClient } from './query-client';

// Auth types
export type {
  AuthUser,
  AuthSession,
  AuthResponse,
  MessageResponse,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ResendVerificationInput,
  VerifyResetCodeInput,
  VerifyPasswordInput,
  ChangePasswordInput,
  StorageAdapter,
  ApiError,
} from './auth/auth.types';

// Auth API functions
export {
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  verifyResetCodeApi,
  resetPasswordApi,
  meApi,
  verifyEmailApi,
  resendVerificationApi,
  verifyPasswordApi,
  changePasswordApi,
  getErrorMessage,
} from './auth/auth.api';

// Auth hooks
export {
  authKeys,
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
  useVerifyResetCode,
  useResetPassword,
  useMe,
  useVerifyEmail,
  useResendVerification,
  useVerifyPassword,
  useChangePassword,
} from './auth/auth.hooks';

// Auth validation schemas
export {
  clientRegisterSchema,
  clientLoginSchema,
  clientForgotPasswordSchema,
  clientVerifyEmailSchema,
  clientResendVerificationSchema,
  clientVerifyResetCodeSchema,
  clientResetPasswordSchema,
  clientVerifyPasswordSchema,
  clientChangePasswordSchema,
  authUserSchema,
  authSessionSchema,
  authResponseSchema,
  messageResponseSchema,
} from './auth/auth.validation';
