// ─────────────────────────────────────────────────────
// @workspace/api — barrel export
// ─────────────────────────────────────────────────────

// Client setup
export {
  createApiClient,
  getApiClient,
  getStorage,
  onAuthError,
  onSlowRequest,
  TOKEN_KEY,
} from './client';

// ── Expense module ────────────────────────────────────
export type {
  Expense,
  ExpenseSplit,
  ExpenseCategory,
  SplitMode,
  CreateExpenseInput,
  UpdateExpenseInput,
  GetExpensesFilter,
  ExpenseSummary,
} from './expenses/expense.types';

export { EXPENSE_CATEGORIES, SPLIT_MODES, expenseSchema } from './expenses/expense.types';

export {
  createExpenseApi,
  getExpensesApi,
  getExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
  getGroupExpensesApi,
  createGroupExpenseApi,
  getExpensesSummaryApi,
} from './expenses/expense.api';

export {
  expenseKeys,
  useExpenses,
  useExpense,
  useGroupExpenses,
  useCreateExpense,
  useCreateGroupExpense,
  useUpdateExpense,
  useDeleteExpense,
  useExpensesSummary,
} from './expenses/expense.hooks';

export {
  clientCreateExpenseSchema,
  clientUpdateExpenseSchema,
} from './expenses/expense.validation';

// ── Group module ──────────────────────────────────────
export type {
  Group,
  GroupMember,
  GroupMemberRole,
  UserSearchResult,
  CreateGroupInput,
  UpdateGroupInput,
  AddMemberInput,
  GroupType,
  GroupDetailConsolidated,
  GroupBalances,
} from './groups/group.types';

export { MAX_GROUP_MEMBERS, MIN_GROUP_MEMBERS, GROUP_TYPES, GroupRole } from './groups/group.types';

export {
  createGroupApi,
  getGroupsApi,
  getGroupBalancesApi,
  getGroupApi,
  updateGroupApi,
  deactivateGroupApi,
  addMemberApi,
  removeMemberApi,
  searchUsersApi,
  searchUsersPaginatedApi,
  leaveGroupApi,
  getGroupDetailApi,
  getGroupActivityApi,
  activateGroupApi,
} from './groups/group.api';

export {
  groupKeys,
  useGroups,
  useGroupBalances,
  useGroup,
  useSearchUsers,
  useSearchUsersPaginated,
  useCreateGroup,
  useUpdateGroup,
  useDeactivateGroup,
  useAddMember,
  useRemoveMember,
  useLeaveGroup,
  useGroupDetail,
  useSendReminder,
  useGroupActivity,
  useActivateGroup,
} from './groups/group.hooks';

export type { ActivityItem, ActivityFeed } from './groups/activity.types';
export { activityFeedSchema, activityItemSchema } from './groups/activity.types';

export {
  useGroupDetailController,
  useGroupAddMemberController,
  useCreateGroupController,
  useGroupsController,
  type GroupsFilterType,
  useAddGroupExpenseController,
  type UseAddGroupExpenseControllerProps,
} from './groups/group.controllers';

export {
  clientCreateGroupSchema,
  clientAddMemberSchema,
  clientUpdateGroupSchema,
} from './groups/group.validation';

// ── Settlement module ─────────────────────────────────
export type {
  Settlement,
  SettlementList,
  SettleUpResponse,
  SettleUpInput,
} from './settlements/settlements.types';

export {
  settlementSchema,
  settlementListSchema,
  settleUpResponseSchema,
} from './settlements/settlements.types';

export { settleUpApi, getGroupSettlementsApi } from './settlements/settlements.api';

export { settlementKeys, useGroupSettlements, useSettleUp } from './settlements/settlements.hooks';

// QueryClient factory
export { createQueryClient } from './query-client';

// Auth types
export type {
  AuthUser,
  AuthSession,
  AuthResponse,
  MessageResponse,
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  VerifyEmailInput,
  ResendVerificationInput,
  VerifyResetCodeInput,
  VerifyPasswordInput,
  ChangePasswordInput,
  StorageAdapter,
  ApiError,
} from './auth/auth.types';

// Auth API functions
export {
  loginApi,
  registerApi,
  logoutApi,
  forgotPasswordApi,
  verifyResetCodeApi,
  resetPasswordApi,
  meApi,
  verifyEmailApi,
  resendVerificationApi,
  verifyPasswordApi,
  changePasswordApi,
  getErrorMessage,
  updateProfileApi,
} from './auth/auth.api';

// Auth hooks
export {
  authKeys,
  useLogin,
  useRegister,
  useLogout,
  useForgotPassword,
  useVerifyResetCode,
  useResetPassword,
  useMe,
  useVerifyEmail,
  useResendVerification,
  useVerifyPassword,
  useChangePassword,
  useUpdateProfile,
} from './auth/auth.hooks';

// Auth controllers
export {
  useLoginController,
  useRegisterController,
  useOtpController,
  useForgotPasswordController,
  useChangePasswordController,
} from './auth/auth.controllers';

// Auth validation schemas
export {
  clientRegisterSchema,
  clientLoginSchema,
  clientForgotPasswordSchema,
  clientVerifyEmailSchema,
  clientResendVerificationSchema,
  clientVerifyResetCodeSchema,
  clientResetPasswordSchema,
  clientVerifyPasswordSchema,
  clientChangePasswordSchema,
  authUserSchema,
  authSessionSchema,
  userResponseSchema,
  messageResponseSchema,
} from './auth/auth.validation';

// ── Wallet module ─────────────────────────────────────
export type {
  Wallet,
  WalletTransaction,
  WalletContribution,
  SetupWalletInput,
  UpdateManagerInput,
  UpdateTargetInput,
  ContributeInput,
} from './wallet/wallet.types';

export {
  useWallet,
  useSetupWallet,
  useUpdateWalletManager,
  useUpdateWalletTarget,
  useContribute,
} from './wallet/wallet.hooks';

// ── Dashboard module ──────────────────────────────────
export type {
  DashboardData,
  DashboardStatsData,
  DashboardExpensesData,
  DashboardGroupsData,
} from './dashboard/dashboard.types';
export {
  getDashboardApi,
  getDashboardStatsApi,
  getDashboardRecentExpensesApi,
  getDashboardGroupsApi,
} from './dashboard/dashboard.api';
export {
  dashboardResponseSchema,
  dashboardStatsSchema,
  dashboardExpensesSchema,
  dashboardGroupsSchema,
} from './dashboard/dashboard.validation';
export {
  useDashboard,
  useDashboardStats,
  useDashboardRecentExpenses,
  useDashboardGroups,
  dashboardKeys,
} from './dashboard/dashboard.hooks';
export { useDashboardController } from './dashboard/dashboard.controllers';

// ── Analytics module ──────────────────────────────────
export type {
  ExpenseAnalytics,
  AnalyticsHistoryItem,
  CategoryAnalyticsItem,
  DebtUser,
  DebtGroup,
  GroupSpentItem,
  GroupDetailAnalytics,
  MemberSpentItem,
} from './analytics/analytics.types';
export {
  expenseAnalyticsResponseSchema,
  analyticsHistoryItemSchema,
  categoryAnalyticsItemSchema,
  debtGroupSchema,
  debtUserSchema,
  debtBalancesResponseSchema,
  groupSpentItemSchema,
  groupAnalyticsResponseSchema,
  groupDetailAnalyticsResponseSchema,
  memberSpentItemSchema,
} from './analytics/analytics.types';
export {
  getExpenseAnalyticsApi,
  getDebtBalancesApi,
  getGroupAnalyticsApi,
  getGroupDetailAnalyticsApi,
} from './analytics/analytics.api';
export {
  useExpenseAnalytics,
  useExpenseAnalyticsInfinite,
  useDebtBalances,
  useGroupAnalytics,
  useGroupDetailAnalytics,
  analyticsKeys,
} from './analytics/analytics.hooks';

// ── Notification module ───────────────────────────────
export type { NotificationItem } from './notifications/notification.types';
export { getNotificationsApi, readNotificationsApi } from './notifications/notification.api';
export {
  notificationKeys,
  useNotifications,
  useReadNotifications,
} from './notifications/notification.hooks';

// ── Invitation module ─────────────────────────────────
export type { Invitation } from './invitations/invitation.types';
export {
  getInvitationsApi,
  acceptInvitationApi,
  declineInvitationApi,
} from './invitations/invitation.api';
export {
  invitationKeys,
  useInvitations,
  useAcceptInvitation,
  useDeclineInvitation,
} from './invitations/invitation.hooks';

// ── Update module ─────────────────────────────────────
export type { UpdateCheckResult, UpdateProvider } from './update/update.types';
export { useUpdateCheck, updateProvider } from './update/update.hooks';
