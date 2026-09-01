import React from 'react';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { onAuthError } from '@workspace/api';

/**
 * Custom Hook: useAuthErrorListener
 *
 * Listens for 401 Unauthenticated API responses emitted from axios interceptors.
 * Invalidates the cached user session, triggers a session expired alert,
 * and navigates the user to the login screen.
 */
export function useAuthErrorListener() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [authAlertVisible, setAuthAlertVisible] = React.useState(false);

  React.useEffect(() => {
    const cleanup = onAuthError(() => {
      queryClient.setQueryData(['auth', 'me'], null);
      setAuthAlertVisible(true);
      router.replace('/(auth)/login');
    });

    return cleanup;
  }, [queryClient, router]);

  const dismissAlert = React.useCallback(() => {
    setAuthAlertVisible(false);
  }, []);

  return {
    authAlertVisible,
    dismissAlert,
  };
}
