import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_KEY, onAuthError } from '@workspace/api';
import type { AuthUser } from '@workspace/api';

// ─────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────

interface AuthContextType {
  /** true once we've checked AsyncStorage for a saved token */
  isReady: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
  /** Call after a successful login/register mutation to sync context state */
  onAuthSuccess: (user: AuthUser) => void;
  logout: () => void;
  /** Skip auth during development / guest mode */
  skipAuth: () => void;
}

// ─────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  // Keep a ref so the onAuthError listener closure always has the latest setter
  const setIsAuthenticatedRef = useRef(setIsAuthenticated);
  setIsAuthenticatedRef.current = setIsAuthenticated;

  // ── Restore session on startup ──────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (!token) {
          setIsReady(true);
          return;
        }
        // Token present — we'll let useMe() in screens fetch the user profile.
        // For now, mark as authenticated so the app can render the tab stack.
        // useMe() will populate the user object shortly after.
        setIsAuthenticated(true);
      } catch {
        // Storage read failed — treat as unauthenticated
      } finally {
        setIsReady(true);
      }
    };

    restoreSession();
  }, []);

  // ── Listen for 401 events from the axios interceptor ──
  useEffect(() => {
    const cleanup = onAuthError(() => {
      setIsAuthenticatedRef.current(false);
      setUser(null);
    });
    return cleanup;
  }, []);

  // ── Called by login/register screens after mutation success ──
  const onAuthSuccess = useCallback((authUser: AuthUser) => {
    setUser(authUser);
    setIsAuthenticated(true);
  }, []);

  // ── Logout ──────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore storage errors on logout
    }
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ── Skip auth (guest / dev bypass) ──────────────────
  const skipAuth = useCallback(() => {
    setUser({
      id: 'guest',
      name: 'Guest User',
      email: 'guest@splitshare.app',
      role: 'USER',
    });
    setIsAuthenticated(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isReady, isAuthenticated, user, onAuthSuccess, logout, skipAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
