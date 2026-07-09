import { QueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export const createQueryClient = (): QueryClient =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 15 * 60 * 1000, // 15 minutes default garbage collection time
        retry: (failureCount, error: unknown) => {
          // Do not retry authentication errors (401/403) or server errors (500+)
          if (error instanceof AxiosError) {
            const status = error.response?.status;
            if (status === 401 || status === 403 || (status && status >= 500)) {
              return false;
            }
          }
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
