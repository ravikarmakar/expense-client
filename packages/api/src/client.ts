import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import type { StorageAdapter } from './auth/auth.types';

export const TOKEN_KEY = 'expense_auth_token';

// ─────────────────────────────────────────────────────
// Event system so apps can react to auth errors
// without coupling the package to navigation
// ─────────────────────────────────────────────────────

type AuthEventListener = () => void;
const authErrorListeners = new Set<AuthEventListener>();

export const onAuthError = (listener: AuthEventListener) => {
  authErrorListeners.add(listener);
  // return cleanup function
  return () => {
    authErrorListeners.delete(listener);
  };
};

/**
 * Deduplication flag — ensures only one auth error event fires
 * per "batch" of concurrent 401 responses. Resets on re-authentication.
 */
let isEmittingAuthError = false;

const emitAuthError = () => {
  if (isEmittingAuthError) return;
  isEmittingAuthError = true;
  authErrorListeners.forEach((l) => l());
};

// ─────────────────────────────────────────────────────
// Event system to notify when requests are taking too long
// ─────────────────────────────────────────────────────

type SlowRequestEventListener = (isSlow: boolean) => void;
const slowRequestListeners = new Set<SlowRequestEventListener>();

export const onSlowRequest = (listener: SlowRequestEventListener) => {
  slowRequestListeners.add(listener);
  return () => {
    slowRequestListeners.delete(listener);
  };
};

let activeSlowRequestsCount = 0;

const emitSlowRequest = (isSlow: boolean) => {
  if (isSlow) {
    activeSlowRequestsCount++;
    if (activeSlowRequestsCount === 1) {
      slowRequestListeners.forEach((l) => l(true));
    }
  } else {
    activeSlowRequestsCount = Math.max(0, activeSlowRequestsCount - 1);
    if (activeSlowRequestsCount === 0) {
      slowRequestListeners.forEach((l) => l(false));
    }
  }
};

// ─────────────────────────────────────────────────────
// Factory — creates an axios instance bound to a
// platform-specific storage adapter and optional online check
// ─────────────────────────────────────────────────────

let _client: AxiosInstance | null = null;
let _storage: StorageAdapter | null = null;

// Extend Axios config type internally to track timers
interface CustomInternalRequestConfig extends InternalAxiosRequestConfig {
  slowTimer?: ReturnType<typeof setTimeout>;
  hasFiredSlow?: boolean;
}

export const createApiClient = (
  baseURL: string,
  storage: StorageAdapter,
  isOnline?: () => Promise<boolean> | boolean
): AxiosInstance => {
  // Wrap the storage adapter to automatically reset the auth error flag when a new token is set
  const wrappedStorage: StorageAdapter = {
    getItem: (key) => storage.getItem(key),
    setItem: async (key, value) => {
      if (key === TOKEN_KEY) {
        isEmittingAuthError = false;
      }
      return storage.setItem(key, value);
    },
    removeItem: async (key) => {
      if (key === TOKEN_KEY) {
        isEmittingAuthError = false;
      }
      return storage.removeItem(key);
    },
  };

  _storage = wrappedStorage;

  _client = axios.create({
    baseURL,
    timeout: 15_000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor — handle JWT, network connectivity, and slow request timer
  _client.interceptors.request.use(
    async (config: CustomInternalRequestConfig) => {
      // 1. Attach JWT Token
      const token = await wrappedStorage.getItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // 2. Setup Slow Request Timer (3.5 seconds)
      config.slowTimer = setTimeout(() => {
        config.hasFiredSlow = true;
        emitSlowRequest(true);
      }, 3500);

      // 3. Handle Abort/Cancel events to prevent state leak
      if (config.signal) {
        config.signal.addEventListener?.('abort', () => {
          if (config.slowTimer) {
            clearTimeout(config.slowTimer);
            if (config.hasFiredSlow) {
              emitSlowRequest(false);
            }
          }
        });
      }

      return config;
    },
    (error: AxiosError) => Promise.reject(error)
  );

  // Response interceptor — handle 401 globally, clear slow request timers
  _client.interceptors.response.use(
    (response) => {
      // Clear slow request timer
      const config = response.config as CustomInternalRequestConfig;
      if (config?.slowTimer) {
        clearTimeout(config.slowTimer);
        if (config.hasFiredSlow) {
          emitSlowRequest(false);
        }
      }
      return response;
    },
    async (error: AxiosError) => {
      // Clear slow request timer
      const config = error.config as CustomInternalRequestConfig;
      if (config?.slowTimer) {
        clearTimeout(config.slowTimer);
        if (config.hasFiredSlow) {
          emitSlowRequest(false);
        }
      }

      // Handle offline/network connectivity errors when no response is received
      if (!error.response) {
        if (isOnline) {
          const online = await isOnline();
          if (!online) {
            error.message = 'No internet connection. Please check your network.';
            error.code = 'ERR_NO_NETWORK';
          } else {
            error.message = 'Server is unreachable. Please try again later.';
            error.code = 'ERR_SERVER_UNREACHABLE';
          }
        } else if (typeof navigator !== 'undefined' && navigator.onLine === false) {
          error.message = 'No internet connection. Please check your network.';
          error.code = 'ERR_NO_NETWORK';
        } else {
          error.message = 'Server is unreachable. Please try again later.';
          error.code = 'ERR_SERVER_UNREACHABLE';
        }
      }

      if (error.response?.status === 401) {
        // Don't treat auth endpoint 401s (bad credentials) as session expiry
        const url = error.config?.url ?? '';
        const isAuthEndpoint = /\/(login|register|verify-email)$/.test(url);

        if (!isAuthEndpoint) {
          // Robust check: Only remove and emit if token exists (avoids duplicate concurrent runs)
          const token = await wrappedStorage.getItem(TOKEN_KEY);
          if (token) {
            await wrappedStorage.removeItem(TOKEN_KEY);
            emitAuthError();
          }
        }
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
