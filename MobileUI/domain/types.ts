import type { Ionicons } from "@expo/vector-icons";

export type IconName = keyof typeof Ionicons.glyphMap;

export type CurrencyCode = "USD" | "EUR" | "GBP" | "PKR" | string;

export interface Money {
  amount: number;
  currency: CurrencyCode;
}

export type TransactionType = "income" | "expense" | "transfer" | "refund" | "adjustment";

export interface TransactionCategory {
  id: string;
  name: string;
  slug: string;
  type?: TransactionType;
  icon?: IconName;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: Money;
  lastFour?: string;
}

export interface BudgetPeriod {
  startsAt: Date;
  endsAt: Date;
  label: string;
}

export interface BudgetLine {
  categoryId: string;
  categoryName: string;
  limit: Money;
  spent: Money;
}

export interface ReceiptAttachment {
  uri: string;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
}

export interface ParsedVoiceExpense {
  transcript: string;
  amount?: Money;
  categoryName?: string;
  merchantName?: string;
  occurredAt?: Date;
  confidence: number;
  needsConfirmation: boolean;
}

export interface SubscriptionEntitlement {
  plan: string;
  isActive: boolean;
  trialEndsAt?: Date;
}
