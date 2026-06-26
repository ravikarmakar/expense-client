import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a QueryClient with production-ready defaults.
 * Call this once per app and pass to QueryClientProvider.
 */
export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
