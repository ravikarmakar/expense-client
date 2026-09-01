import { AppState } from 'react-native';
import { focusManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createQueryClient } from '@workspace/api';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';

/**
 * Query Client & Persistence Configuration
 *
 * Configures TanStack Query focus manager, offline AsyncStorage persister,
 * and dehydrate query filtering options for instant app loads.
 */

// 1. Create QueryClient singleton instance
export const queryClient = createQueryClient();

// 2. Configure TanStack Query focusManager for React Native AppState changes
focusManager.setEventListener((onFocus) => {
  const subscription = AppState.addEventListener('change', (status) => {
    if (status === 'active') {
      onFocus();
    }
  });

  return () => subscription.remove();
});

// 3. Create AsyncStorage persister for offline cache persistence
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1000,
});

// 4. Query Cache persistence options
export const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
  dehydrateOptions: {
    shouldDehydrateQuery: (query) => {
      // Skip persisting auth queries (they should always be fresh from network) and failed queries
      const isAuthQuery = query.queryKey[0] === 'auth';
      const isSuccess = query.state.status === 'success';
      return isSuccess && !isAuthQuery;
    },
  },
};
