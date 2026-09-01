import React from 'react';
import NetInfo from '@react-native-community/netinfo';

/**
 * Custom Hook: useNetworkStatus
 *
 * Monitors real-time network connectivity changes using NetInfo.
 * Provides a retry function to verify connection and trigger callbacks.
 */
export function useNetworkStatus(onRetrySuccess?: () => Promise<unknown> | unknown) {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return unsubscribe;
  }, []);

  const retryConnection = React.useCallback(async (): Promise<void> => {
    const state = await NetInfo.fetch();
    const connected = state.isConnected === true;
    if (connected) {
      setIsOffline(false);
      await onRetrySuccess?.();
    }
  }, [onRetrySuccess]);

  return {
    isOffline,
    retryConnection,
  };
}
