import { z } from 'zod';
import {
  dashboardResponseSchema,
  dashboardStatsSchema,
  dashboardExpensesSchema,
  dashboardGroupsSchema,
} from './dashboard.validation';

export type DashboardData = z.infer<typeof dashboardResponseSchema>['data'];
export type DashboardStatsData = z.infer<typeof dashboardStatsSchema>['data'];
export type DashboardExpensesData = z.infer<typeof dashboardExpensesSchema>['data'];
export type DashboardGroupsData = z.infer<typeof dashboardGroupsSchema>['data'];
