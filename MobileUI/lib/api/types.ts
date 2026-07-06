export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
  user: UserProfileDto;
}

export interface UserProfileDto {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
  initials?: string;
  plan?: string;
  subscriptionTier?: string;
  balance?: number;
  balanceChangePct?: number;
  accountsConnected?: number;
  accountCount?: number;
  transactionCount?: number;
  categoryCount?: number;
  savedAmount?: number;
  currencyCode?: string;
}

export interface UserPreferencesDto {
  notificationsEnabled: boolean;
  currencyCode: string;
}

export interface AccountDto {
  id: string;
  name: string;
  type?: string;
  accountType?: string;
  balance: number;
  lastFour?: string;
  lastFourDigits?: string;
  iconKey?: string;
  iconColor?: string;
  isDefault?: boolean;
  hasIncomeTransactions?: boolean;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  type?: string;
  icon?: string;
  iconKey?: string;
  iconBg?: string;
  iconColor?: string;
}

export interface TransactionDto {
  id: string;
  name?: string;
  description?: string;
  amount: number;
  categorySlug?: string;
  categoryName?: string;
  categoryIconKey?: string;
  categoryIconBg?: string;
  categoryIconColor?: string;
  type?: string;
  accountId?: string;
  accountName?: string;
  note?: string | null;
  receiptUrl?: string | null;
  occurredAt?: string;
  createdAt?: string;
}

export interface CreateTransactionRequest {
  amount: number;
  categoryId?: string;
  categorySlug?: string;
  accountId?: string;
  name?: string;
  description?: string;
  type?: string;
  occurredAt?: string;
  note?: string | null;
  receiptUrl?: string | null;
}

export type UpdateTransactionRequest = Partial<CreateTransactionRequest>;

export interface BudgetLineDto {
  categoryId: string;
  categoryName: string;
  categorySlug?: string;
  iconKey?: string;
  iconBg?: string;
  iconColor?: string;
  spent?: number;
  spentAmount?: number;
  limit?: number;
  limitAmount?: number;
}

export interface BudgetSummaryDto {
  totalBudget?: number;
  totalLimit?: number;
  totalSpent: number;
  daysRemaining?: number;
  monthLabel?: string;
  lines: BudgetLineDto[];
}

export interface SpendingSegmentDto {
  categorySlug: string;
  categoryName: string;
  iconKey?: string;
  iconBg?: string;
  iconColor?: string;
  amount: number;
  percent?: number;
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
  type?: "tip" | "alert" | "positive";
  title: string;
  body?: string;
  message?: string;
  iconKey?: string;
  tag?: string;
}

export interface WeeklySpendDto {
  days?: { day: string; amount: number }[];
  items?: { day: string; amount: number }[];
}

export interface NotificationDto {
  id: string;
  title: string;
  body: string;
  createdAt?: string;
  read?: boolean;
  isRead?: boolean;
  iconKey?: string;
  iconColor?: string;
  iconBg?: string;
}

export interface SubscriptionPlanDto {
  slug: string;
  name: string;
  price: number;
  billingPeriod: string;
  badge?: string;
  tag?: string;
  isPopular?: boolean;
}

export interface UserSubscriptionDto {
  plan: string;
  status: string;
  trialEndsAt?: string;
}

export interface ParseVoiceRequest {
  transcript: string;
}

export interface ParseVoiceResponse {
  amount?: number;
  categorySlug?: string;
  categoryName?: string;
  merchantName?: string;
  note?: string;
  occurredAt?: string;
  confidence?: number;
}

export interface CreateAccountRequest {
  name: string;
  type?: string;
  accountType?: string;
  balance?: number;
  initialBalance?: number;
  lastFourDigits?: string;
  iconKey?: string;
  iconColor?: string;
}

export interface UpdateAccountRequest {
  name: string;
  accountType?: string;
  balance?: number;
  lastFourDigits?: string;
  iconKey?: string;
  iconColor?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page?: number;
  pageSize?: number;
}
