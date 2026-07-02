import { useQuery } from '@tanstack/react-query';
import { getDashboardApi } from './dashboard.api';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: () => [...dashboardKeys.all, 'detail'] as const,
};

export const useDashboard = () =>
  useQuery({
    queryKey: dashboardKeys.detail(),
    queryFn: getDashboardApi,
    staleTime: 60 * 1000, // 1 minute
  });
