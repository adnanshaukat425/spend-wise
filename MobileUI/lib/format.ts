import { formatMoney } from "@/domain/money";
import {
  formatRelativeTransactionDate,
  formatTransactionTime as formatDomainTransactionTime,
  getCurrentMonthPeriod,
} from "@/domain/dates";

export function formatCurrency(
  amount: number,
  options?: { compact?: boolean; showSign?: boolean },
): string {
  return formatMoney(amount, options);
}

export function getCurrentMonthLabel(): string {
  return getCurrentMonthPeriod().label;
}

export function formatTransactionTime(date = new Date()): string {
  return formatDomainTransactionTime(date);
}

export function formatTransactionDate(date = new Date()): string {
  return formatRelativeTransactionDate(date);
}
