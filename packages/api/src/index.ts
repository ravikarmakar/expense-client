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
  StorageAdapter,
  ApiError,
} from './auth/auth.types';

// Auth API functions
export {
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  resetPasswordApi,
  meApi,
  getErrorMessage,
} from './auth/auth.api';

// Auth hooks
export {
  authKeys,
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
  useResetPassword,
  useMe,
} from './auth/auth.hooks';
