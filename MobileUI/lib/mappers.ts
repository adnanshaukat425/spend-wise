import type {
  AccountDto,
  BudgetLineDto,
  BudgetSummaryDto,
  CategoryDto,
  InsightDto,
  NotificationDto,
  SpendingSegmentDto,
  TransactionDto,
  UserPreferencesDto,
  UserProfileDto,
  WeeklySpendDto,
} from "@/lib/api/types";
import type { IconName } from "@/domain/types";
import type {
  BudgetCategory,
  BudgetSummary,
  Insight,
  LinkedAccount,
  Notification,
  SpendingSegment,
  Transaction,
  UserPreferences,
  UserProfile,
  WeeklySpend,
} from "@/data/types";
import { formatRelativeTransactionDate, formatTransactionTime, getCurrentMonthPeriod } from "@/domain/dates";

const SEGMENT_COLORS = ["#2E7D52", "#F59E0B", "#1976D2", "#E91E63", "#6B7280"];

function asIcon(name: string | undefined, fallback: IconName): IconName {
  return (name ?? fallback) as IconName;
}

export function defaultBudgetSummary(): BudgetSummary {
  const period = getCurrentMonthPeriod();
  return {
    daysRemaining: 0,
    monthLabel: period.label,
    totalBudget: 0,
    totalSpent: 0,
  };
}

export function mapTransaction(dto: TransactionDto): Transaction {
  const date = new Date(dto.occurredAt ?? dto.createdAt ?? Date.now());
  return {
    amount: dto.amount,
    category: dto.categoryName ?? dto.categorySlug ?? "Uncategorized",
    date: formatRelativeTransactionDate(date),
    icon: asIcon(dto.categoryIconKey, dto.amount < 0 ? "card-outline" : "cash-outline"),
    iconBg: dto.categoryIconBg ?? (dto.amount < 0 ? "#FEE2E2" : "#DCFCE7"),
    iconColor: dto.categoryIconColor ?? (dto.amount < 0 ? "#B91C1C" : "#15803D"),
    id: dto.id,
    name: dto.name ?? dto.description ?? "Transaction",
    note: dto.note ?? undefined,
    receiptUri: dto.receiptUrl ?? undefined,
    time: formatTransactionTime(date),
  };
}

export function mapSpendingSegment(dto: SpendingSegmentDto, index = 0): SpendingSegment {
  return {
    amount: dto.amount,
    color: dto.color ?? SEGMENT_COLORS[index % SEGMENT_COLORS.length],
    name: dto.name,
  };
}

export function mapBudgetSummary(dto: BudgetSummaryDto): BudgetSummary {
  return {
    daysRemaining: dto.daysRemaining ?? 0,
    monthLabel: dto.monthLabel ?? getCurrentMonthPeriod().label,
    totalBudget: dto.totalBudget ?? dto.totalLimit ?? 0,
    totalSpent: dto.totalSpent,
  };
}

export function mapBudgetCategory(dto: BudgetLineDto): BudgetCategory {
  return {
    icon: asIcon(dto.iconKey, "wallet-outline"),
    iconBg: dto.iconBg ?? "#EEF9F2",
    iconColor: dto.iconColor ?? "#2E7D52",
    id: dto.categoryId,
    limit: dto.limitAmount ?? dto.limit ?? 0,
    name: dto.categoryName,
    spent: dto.spent ?? dto.spentAmount ?? 0,
  };
}

export function mapCategoryOption(dto: CategoryDto) {
  return {
    categoryId: dto.id,
    icon: asIcon(dto.iconKey ?? dto.icon, "pricetag-outline"),
    id: dto.slug ?? dto.id,
    label: dto.name,
    name: dto.name,
    slug: dto.slug,
    type: dto.type,
  };
}

export function mapInsight(dto: InsightDto): Insight {
  const type = dto.type ?? "tip";
  return {
    bgColor: type === "alert" ? "#FEF3C7" : type === "positive" ? "#DCFCE7" : "#E0F2FE",
    body: dto.body ?? dto.message ?? "",
    icon: asIcon(
      dto.iconKey,
      type === "alert" ? "warning-outline" : type === "positive" ? "trending-up-outline" : "bulb-outline",
    ),
    iconColor: type === "alert" ? "#D97706" : type === "positive" ? "#15803D" : "#0369A1",
    id: dto.id,
    tag: dto.tag ?? type.toUpperCase(),
    title: dto.title,
    type,
  };
}

export function mapWeeklySpend(dto: WeeklySpendDto): WeeklySpend[] {
  return (dto.days ?? dto.items ?? []).map((item) => ({
    amount: item.amount,
    day: item.day,
  }));
}

export function mapNotification(dto: NotificationDto): Notification {
  const date = new Date(dto.createdAt ?? Date.now());
  const read = dto.read ?? dto.isRead ?? false;
  return {
    body: dto.body,
    icon: read ? "notifications-outline" : "notifications",
    iconBg: read ? "#F3F4F6" : "#EEF9F2",
    iconColor: read ? "#6B7280" : "#2E7D52",
    id: dto.id,
    read,
    time: formatRelativeTransactionDate(date),
    title: dto.title,
  };
}

export function mapAccount(dto: AccountDto): LinkedAccount {
  return {
    balance: dto.balance,
    icon: asIcon(dto.iconKey, "card-outline"),
    iconColor: dto.iconColor ?? "#2E7D52",
    id: dto.id,
    lastFour: dto.lastFourDigits ?? dto.lastFour ?? "",
    name: dto.name,
    type: dto.accountType ?? dto.type ?? "Account",
  };
}

export function mapPreferences(dto: UserPreferencesDto): UserPreferences {
  return {
    currency: dto.currencyCode,
    notifications: dto.notificationsEnabled,
  };
}

export function mapUserProfile(dto: UserProfileDto, dashboard?: { balance?: number; balanceChangePct?: number }): UserProfile {
  const name = dto.displayName ?? dto.name ?? "SpendWise User";
  const initials = (dto.initials ?? name)
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return {
    accountsConnected: dto.accountsConnected ?? dto.accountCount ?? 0,
    balance: dto.balance ?? dashboard?.balance ?? 0,
    balanceChangePct: dto.balanceChangePct ?? dashboard?.balanceChangePct ?? 0,
    email: dto.email,
    initials: initials || "SW",
    name,
    plan: dto.plan ?? dto.subscriptionTier ?? "Free",
    stats: {
      categories: dto.categoryCount ?? 0,
      saved: dto.savedAmount ?? 0,
      transactions: dto.transactionCount ?? 0,
    },
  };
}
