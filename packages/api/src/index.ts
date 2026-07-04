// ─────────────────────────────────────────────────────
// @workspace/api — barrel export
// ─────────────────────────────────────────────────────

// Client setup
export { createApiClient, getApiClient, getStorage, onAuthError, TOKEN_KEY } from './client';

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
  SettleUpInput,
  Settlement,
  GroupType,
  GroupDetailConsolidated,
} from './groups/group.types';

export { MAX_GROUP_MEMBERS, MIN_GROUP_MEMBERS, GROUP_TYPES } from './groups/group.types';

export {
  createGroupApi,
  getGroupsApi,
  getGroupApi,
  updateGroupApi,
  deactivateGroupApi,
  addMemberApi,
  removeMemberApi,
  searchUsersApi,
  searchUsersPaginatedApi,
  settleUpApi,
  leaveGroupApi,
  getGroupDetailApi,
} from './groups/group.api';

export {
  groupKeys,
  useGroups,
  useGroup,
  useSearchUsers,
  useSearchUsersPaginated,
  useCreateGroup,
  useUpdateGroup,
  useDeactivateGroup,
  useAddMember,
  useRemoveMember,
  useSettleUp,
  useLeaveGroup,
  useGroupSettlements,
  useGroupDetail,
} from './groups/group.hooks';

export {
  clientCreateGroupSchema,
  clientAddMemberSchema,
  clientUpdateGroupSchema,
} from './groups/group.validation';

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
export type { DashboardData } from './dashboard/dashboard.types';
export { getDashboardApi } from './dashboard/dashboard.api';
export { useDashboard, dashboardKeys } from './dashboard/dashboard.hooks';

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
