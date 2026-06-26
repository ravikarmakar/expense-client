// ─────────────────────────────────────────────
// Core domain types (mirrors server responses)
// ─────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthSession {
  id: string;
  expiresAt: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: AuthUser;
    session: AuthSession;
    token: string;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// ─────────────────────────────────────────────
// Request payload types (match server validation)
// ─────────────────────────────────────────────

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
  token: string;
  newPassword: string;
}

// ─────────────────────────────────────────────
// Storage adapter — platform-agnostic interface
// Mobile uses AsyncStorage, Web uses localStorage
// ─────────────────────────────────────────────

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// ─────────────────────────────────────────────
// API error type (for structured error handling)
// ─────────────────────────────────────────────

export interface ApiError {
  message: string;
  statusCode?: number;
}
