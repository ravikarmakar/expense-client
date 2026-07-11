export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  emailVerified?: boolean;
  image?: string | null;
}

export interface AuthSession {
  id: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    session?: AuthSession;
    token?: string;
    requiresVerification?: boolean;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string | null;
  };
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

export interface VerifyEmailInput {
  email: string;
  code: string;
}

export interface ResendVerificationInput {
  email: string;
}

export interface VerifyResetCodeInput {
  email: string;
  code: string;
}

export interface VerifyPasswordInput {
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
