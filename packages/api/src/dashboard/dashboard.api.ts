import { getApiClient } from '../client';
import {
  dashboardResponseSchema,
  dashboardStatsSchema,
  dashboardExpensesSchema,
  dashboardGroupsSchema,
} from './dashboard.validation';
import {
  type DashboardData,
  type DashboardStatsData,
  type DashboardExpensesData,
  type DashboardGroupsData,
} from './dashboard.types';

export const getDashboardApi = async (): Promise<DashboardData> => {
  const { data } = await getApiClient().get<unknown>('/dashboard');
  const parsed = dashboardResponseSchema.parse(data);
  return parsed.data;
};

export const getDashboardStatsApi = async (): Promise<DashboardStatsData> => {
  const { data } = await getApiClient().get<unknown>('/dashboard/stats');
  const parsed = dashboardStatsSchema.parse(data);
  return parsed.data;
};

export const getDashboardRecentExpensesApi = async (): Promise<DashboardExpensesData> => {
  const { data } = await getApiClient().get<unknown>('/dashboard/recent-expenses');
  const parsed = dashboardExpensesSchema.parse(data);
  return parsed.data;
};

export const getDashboardGroupsApi = async (): Promise<DashboardGroupsData> => {
  const { data } = await getApiClient().get<unknown>('/dashboard/groups');
  const parsed = dashboardGroupsSchema.parse(data);
  return parsed.data;
};
