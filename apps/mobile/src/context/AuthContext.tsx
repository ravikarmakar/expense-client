import React, { createContext, useContext, useState } from 'react';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  verifyOtp: (code: string) => Promise<boolean>;
  logout: () => void;
  skipAuth: () => void;
  loginWithGoogle: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Mock successful login
    setUser({ name: 'Alexander Wright', email });
    setIsAuthenticated(true);
    return true;
  };

  const signup = async (name: string, email: string, _password: string): Promise<boolean> => {
    // Mock successful signup, transitions to OTP step
    setUser({ name, email });
    return true;
  };

  const verifyOtp = async (_code: string): Promise<boolean> => {
    // Mock successful verification
    setIsAuthenticated(true);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  const skipAuth = () => {
    setUser({ name: 'Alexander (Guest)', email: 'guest@splitshare.com' });
    setIsAuthenticated(true);
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    // Mock Google Sign-In delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setUser({ name: 'Google User', email: 'google.user@gmail.com' });
    setIsAuthenticated(true);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        signup,
        verifyOtp,
        logout,
        skipAuth,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
