import { getApiClient } from '../client';
import { dashboardResponseSchema, type DashboardData } from './dashboard.types';

export const getDashboardApi = async (): Promise<DashboardData> => {
  const { data } = await getApiClient().get<unknown>('/dashboard');
  const parsed = dashboardResponseSchema.parse(data);
  return parsed.data;
};
