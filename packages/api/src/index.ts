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
} from './groups/group.types';

export { MAX_GROUP_MEMBERS, MIN_GROUP_MEMBERS } from './groups/group.types';

export {
  createGroupApi,
  getGroupsApi,
  getGroupApi,
  updateGroupApi,
  deleteGroupApi,
  addMemberApi,
  removeMemberApi,
  searchUsersApi,
  settleUpApi,
  leaveGroupApi,
} from './groups/group.api';

export {
  groupKeys,
  useGroups,
  useGroup,
  useSearchUsers,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddMember,
  useRemoveMember,
  useSettleUp,
  useLeaveGroup,
  useGroupSettlements,
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
  authResponseSchema,
  messageResponseSchema,
} from './auth/auth.validation';
