import type { IconName } from "@/domain/types";

export type { IconName } from "@/domain/types";

export interface Transaction {
  id: string;
  name: string;
  category: string;
  amount: number;
  time: string;
  date: string;
  icon: IconName;
  iconBg: string;
  iconColor: string;
  note?: string;
  receiptUri?: string;
  isUserAdded?: boolean;
}

export interface SpendingSegment {
  id: string;
  name: string;
  amount: number;
  color: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon: IconName;
  iconBg: string;
  iconColor: string;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  daysRemaining: number;
  monthLabel: string;
}

export interface UserProfile {
  name: string;
  email: string;
  initials: string;
  plan: string;
  balance: number;
  balanceChangePct: number;
  accountsConnected: number;
  stats: {
    transactions: number;
    categories: number;
    saved: number;
  };
}

export interface WeeklySpend {
  day: string;
  amount: number;
}

export interface Insight {
  id: string;
  type: "tip" | "alert" | "positive";
  title: string;
  body: string;
  icon: IconName;
  iconColor: string;
  bgColor: string;
  tag: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: IconName;
  iconColor: string;
  iconBg: string;
}

export interface LinkedAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  lastFour: string;
  icon: IconName;
  iconColor: string;
}

export interface UserPreferences {
  notifications: boolean;
  currency: string;
}
