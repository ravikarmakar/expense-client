import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { StorageAdapter } from './auth/auth.types';

export const TOKEN_KEY = '@expense/auth_token';

// ─────────────────────────────────────────────────────
// Event system so apps can react to auth errors
// without coupling the package to navigation
// ─────────────────────────────────────────────────────

type AuthEventListener = () => void;
const authErrorListeners: AuthEventListener[] = [];

export const onAuthError = (listener: AuthEventListener) => {
  authErrorListeners.push(listener);
  // return cleanup function
  return () => {
    const idx = authErrorListeners.indexOf(listener);
    if (idx > -1) authErrorListeners.splice(idx, 1);
  };
};

const emitAuthError = () => {
  authErrorListeners.forEach((l) => l());
};

// ─────────────────────────────────────────────────────
// Factory — creates an axios instance bound to a
// platform-specific storage adapter
// ─────────────────────────────────────────────────────

let _client: AxiosInstance | null = null;
let _storage: StorageAdapter | null = null;

export const createApiClient = (baseURL: string, storage: StorageAdapter): AxiosInstance => {
  _storage = storage;

  _client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor — attach JWT
  _client.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await storage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor — handle 401 globally
  _client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        await storage.removeItem(TOKEN_KEY);
        emitAuthError();
      }
      return Promise.reject(error);
    }
  );

  return _client;
};

/**
 * Returns the axios instance. Must call createApiClient() first.
 */
export const getApiClient = (): AxiosInstance => {
  if (!_client) {
    throw new Error('[api] Call createApiClient() before using getApiClient()');
  }
  return _client;
};

/**
 * Returns the storage adapter. Must call createApiClient() first.
 */
export const getStorage = (): StorageAdapter => {
  if (!_storage) {
    throw new Error('[api] Call createApiClient() before using getStorage()');
  }
  return _storage;
};
