/** API DTOs aligned with SpendWise .NET backend */

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfileDto;
}

export interface UserProfileDto {
  id: string;
  email: string;
  displayName: string;
  initials: string;
  subscriptionTier: string;
  transactionCount: number;
  accountCount: number;
  currencyCode: string;
}

export interface UserPreferencesDto {
  notificationsEnabled: boolean;
  currencyCode: string;
}

export interface AccountDto {
  id: string;
  name: string;
  accountType: string;
  balance: number;
  lastFourDigits: string;
  iconKey: string;
  iconColor: string;
}

export interface CategoryDto {
  id: string;
  slug: string;
  name: string;
  type: string;
  iconKey: string;
  iconBg: string;
  iconColor: string;
}

export interface TransactionDto {
  id: string;
  name: string;
  amount: number;
  categorySlug: string;
  categoryName: string;
  categoryIconKey: string;
  categoryIconBg: string;
  categoryIconColor: string;
  type: string;
  accountId: string;
  accountName: string;
  note?: string | null;
  receiptUrl?: string | null;
  occurredAt: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface BudgetLineDto {
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  iconKey: string;
  iconBg: string;
  iconColor: string;
  limitAmount: number;
  spentAmount: number;
  percentUsed: number;
}

export interface BudgetSummaryDto {
  id: string;
  year: number;
  month: number;
  totalLimit: number;
  totalSpent: number;
  percentUsed: number;
  lines: BudgetLineDto[];
}

export interface SpendingSegmentDto {
  categorySlug: string;
  categoryName: string;
  iconKey: string;
  iconBg: string;
  iconColor: string;
  amount: number;
  percent: number;
}

export interface DashboardDto {
  balance: number;
  balanceChangePct: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  spendingByCategory: SpendingSegmentDto[];
  recentTransactions: TransactionDto[];
  budgetSummary?: BudgetSummaryDto | null;
}

export interface InsightDto {
  id: string;
  type: string;
  title: string;
  description: string;
  actionLabel?: string | null;
  actionRoute?: string | null;
}

export interface WeeklySpendDayDto {
  day: string;
  amount: number;
}

export interface WeeklySpendDto {
  days: WeeklySpendDayDto[];
  total: number;
}

export interface NotificationDto {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  iconKey: string;
  iconColor: string;
  iconBg: string;
  createdAt: string;
}

export interface SubscriptionPlanDto {
  id: string;
  slug: string;
  name: string;
  price: number;
  billingPeriod: string;
  badge?: string | null;
  tag?: string | null;
  isPopular: boolean;
  features: string[];
}

export interface UserSubscriptionDto {
  tier: string;
  status: string;
  planName?: string | null;
  trialEndsAt?: string | null;
}

export interface CreateTransactionRequest {
  accountId: string;
  categorySlug: string;
  name: string;
  amount: number;
  note?: string | null;
  receiptUrl?: string | null;
  occurredAt?: string | null;
}

export interface UpdateTransactionRequest {
  name?: string | null;
  amount?: number | null;
  note?: string | null;
  receiptUrl?: string | null;
}

export interface CreateAccountRequest {
  name: string;
  accountType: string;
  balance: number;
  lastFourDigits: string;
  iconKey: string;
  iconColor: string;
}

export interface UpdateBudgetTotalRequest {
  totalLimit: number;
}

export interface UpdateBudgetLinesRequest {
  lines: { categoryId: string; limitAmount: number }[];
}

export interface ParseVoiceRequest {
  transcript: string;
}

export interface ParseVoiceResponse {
  amount: number | null;
  categorySlug: string | null;
  note: string | null;
}
