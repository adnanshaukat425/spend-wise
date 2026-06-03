import type {
  AccountDto,
  BudgetLineDto,
  BudgetSummaryDto,
  CategoryDto,
  DashboardDto,
  InsightDto,
  NotificationDto,
  SpendingSegmentDto,
  TransactionDto,
  UserPreferencesDto,
  UserProfileDto,
  WeeklySpendDto,
} from "@/lib/api/types";
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
  IconName,
} from "@/data/types";
import {
  formatTransactionDate,
  formatTransactionTime,
  getCurrentMonthLabel,
} from "@/lib/format";

const SEGMENT_COLORS = [
  "#FF6B35",
  "#8B5CF6",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#9CA3AF",
  "#10B981",
  "#E07B39",
];

const ICON_KEY_MAP: Record<string, IconName> = {
  restaurant: "restaurant-outline",
  food: "restaurant-outline",
  car: "car-outline",
  transport: "car-outline",
  bag: "bag-outline",
  shopping: "bag-outline",
  cafe: "cafe-outline",
  coffee: "cafe-outline",
  home: "home-outline",
  flash: "flash-outline",
  utilities: "flash-outline",
  heart: "heart-outline",
  health: "heart-outline",
  airplane: "airplane-outline",
  travel: "airplane-outline",
  game: "game-controller-outline",
  fun: "game-controller-outline",
  school: "school-outline",
  tv: "tv-outline",
  bills: "tv-outline",
  cart: "cart-outline",
  trending: "trending-up-outline",
  income: "trending-up-outline",
  wallet: "wallet-outline",
  card: "card-outline",
  business: "business-outline",
  laptop: "laptop-outline",
  warning: "warning-outline",
  bulb: "bulb-outline",
  analytics: "analytics-outline",
  trophy: "trophy-outline",
  "bar-chart": "bar-chart-outline",
  notifications: "notifications-outline",
  sparkles: "sparkles-outline",
};

export function mapIconKey(iconKey: string): IconName {
  const normalized = iconKey.replace(/-outline$/i, "").toLowerCase();
  if (ICON_KEY_MAP[normalized]) {
    return ICON_KEY_MAP[normalized];
  }
  const withOutline = `${normalized}-outline` as IconName;
  return withOutline;
}

function signedAmount(dto: TransactionDto): number {
  const raw = dto.amount;
  if (dto.type?.toLowerCase() === "income") {
    return Math.abs(raw);
  }
  if (dto.type?.toLowerCase() === "expense") {
    return raw <= 0 ? raw : -Math.abs(raw);
  }
  return raw;
}

export function mapTransaction(dto: TransactionDto): Transaction {
  const occurred = new Date(dto.occurredAt);
  const amount = signedAmount(dto);
  return {
    id: dto.id,
    name: dto.name,
    category: dto.categoryName,
    amount,
    time: formatTransactionTime(occurred),
    date: formatTransactionDate(occurred),
    icon: mapIconKey(dto.categoryIconKey),
    iconBg: dto.categoryIconBg,
    iconColor: dto.categoryIconColor,
    note: dto.note ?? undefined,
    receiptUri: dto.receiptUrl ?? undefined,
  };
}

export function mapSpendingSegment(
  dto: SpendingSegmentDto,
  colorIndex: number,
): SpendingSegment {
  return {
    name: dto.categoryName,
    amount: dto.amount,
    color: dto.iconColor || SEGMENT_COLORS[colorIndex % SEGMENT_COLORS.length],
  };
}

export function mapBudgetCategory(line: BudgetLineDto): BudgetCategory {
  return {
    id: line.categoryId,
    name: line.categoryName,
    spent: line.spentAmount,
    limit: line.limitAmount,
    icon: mapIconKey(line.iconKey),
    iconBg: line.iconBg,
    iconColor: line.iconColor,
  };
}

export function mapBudgetSummary(dto: BudgetSummaryDto): BudgetSummary {
  const now = new Date();
  const isCurrentMonth =
    dto.year === now.getFullYear() && dto.month === now.getMonth() + 1;
  const lastDay = new Date(dto.year, dto.month, 0).getDate();
  const daysRemaining = isCurrentMonth
    ? Math.max(0, lastDay - now.getDate())
    : 0;
  const monthLabel = new Date(dto.year, dto.month - 1, 1).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" },
  );

  return {
    totalBudget: dto.totalLimit,
    totalSpent: dto.totalSpent,
    daysRemaining,
    monthLabel,
  };
}

export function mapUserProfile(
  dto: UserProfileDto,
  dashboard?: DashboardDto | null,
): UserProfile {
  const tier = dto.subscriptionTier || "Free";
  const plan =
    tier.toLowerCase() === "free"
      ? "Free Plan"
      : tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase() + " Plan";

  return {
    name: dto.displayName,
    email: dto.email,
    initials: dto.initials,
    plan,
    balance: dashboard?.balance ?? 0,
    balanceChangePct: dashboard?.balanceChangePct ?? 0,
    accountsConnected: dto.accountCount,
    stats: {
      transactions: dto.transactionCount,
      categories: 0,
      saved: Math.max(
        0,
        (dashboard?.monthlyIncome ?? 0) - (dashboard?.monthlyExpenses ?? 0),
      ),
    },
  };
}

export function mapPreferences(dto: UserPreferencesDto): UserPreferences {
  return {
    notifications: dto.notificationsEnabled,
    currency: dto.currencyCode,
  };
}

export function mapInsight(dto: InsightDto): Insight {
  const type =
    dto.type?.toLowerCase() === "alert"
      ? "alert"
      : dto.type?.toLowerCase() === "positive"
        ? "positive"
        : "tip";

  const icon: IconName =
    type === "alert"
      ? "warning-outline"
      : type === "positive"
        ? "trending-up-outline"
        : "bulb-outline";

  const iconColor =
    type === "alert" ? "#EF4444" : type === "positive" ? "#10B981" : "#F59E0B";
  const bgColor =
    type === "alert" ? "#FEE2E2" : type === "positive" ? "#D1FAE5" : "#FEF3C7";

  return {
    id: dto.id,
    type,
    title: dto.title,
    body: dto.description,
    icon,
    iconColor,
    bgColor,
    tag: dto.type ?? "Insight",
  };
}

export function mapWeeklySpend(dto: WeeklySpendDto): WeeklySpend[] {
  return dto.days.map((d) => ({ day: d.day, amount: d.amount }));
}

export function mapNotification(dto: NotificationDto): Notification {
  const created = new Date(dto.createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  let time: string;
  if (diffHours < 1) {
    time = "Just now";
  } else if (diffHours < 24) {
    time = `${diffHours}h ago`;
  } else if (diffHours < 48) {
    time = "Yesterday";
  } else {
    const days = Math.floor(diffHours / 24);
    time = `${days} days ago`;
  }

  return {
    id: dto.id,
    title: dto.title,
    body: dto.body,
    time,
    read: dto.isRead,
    icon: mapIconKey(dto.iconKey),
    iconColor: dto.iconColor,
    iconBg: dto.iconBg,
  };
}

export function mapAccount(dto: AccountDto): LinkedAccount {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.accountType,
    balance: dto.balance,
    lastFour: dto.lastFourDigits,
    icon: mapIconKey(dto.iconKey),
    iconColor: dto.iconColor,
  };
}

export function mapCategoryOption(cat: CategoryDto) {
  return {
    id: cat.slug,
    categoryId: cat.id,
    slug: cat.slug,
    label: cat.name,
    icon: mapIconKey(cat.iconKey),
    iconBg: cat.iconBg,
    iconColor: cat.iconColor,
  };
}

export function defaultBudgetSummary(): BudgetSummary {
  return {
    totalBudget: 0,
    totalSpent: 0,
    daysRemaining: 0,
    monthLabel: getCurrentMonthLabel(),
  };
}
