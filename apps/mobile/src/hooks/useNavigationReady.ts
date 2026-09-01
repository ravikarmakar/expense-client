import React from 'react';
import { useNavigationContainerRef } from 'expo-router';

/**
 * Custom Hook: useNavigationReady
 *
 * Listens to Expo Router's root navigation container ready state.
 * Ensures initial route redirection runs only after the navigator is mounted.
 */
export function useNavigationReady() {
  const navigationRef = useNavigationContainerRef();
  const [isNavigationReady, setIsNavigationReady] = React.useState(false);

  React.useEffect(() => {
    if (isNavigationReady) return;

    if (navigationRef?.isReady()) {
      setIsNavigationReady(true);
      return;
    }

    const unsubscribe = navigationRef?.addListener?.('state', () => {
      if (navigationRef?.isReady()) {
        setIsNavigationReady(true);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigationRef, isNavigationReady]);

  return isNavigationReady;
}
