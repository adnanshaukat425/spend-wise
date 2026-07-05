import type { CurrencyCode, Money, TransactionType } from "./types";

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

export function createMoney(amount: number, currency: CurrencyCode = DEFAULT_CURRENCY): Money {
  return { amount: normalizeMoneyAmount(amount), currency };
}

export function normalizeMoneyAmount(amount: number): number {
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

export function getSignedTransactionAmount(
  amount: number,
  type: TransactionType,
): number {
  const normalized = Math.abs(normalizeMoneyAmount(amount));

  if (type === "expense" || type === "transfer") {
    return -normalized;
  }

  return normalized;
}

export function formatMoney(
  money: Money | number,
  options?: {
    compact?: boolean;
    showSign?: boolean;
    currency?: CurrencyCode;
    locale?: string;
  },
): string {
  const amount = typeof money === "number" ? money : money.amount;
  const currency = options?.currency ?? (typeof money === "number" ? DEFAULT_CURRENCY : money.currency);
  const locale = options?.locale ?? "en-US";
  const abs = Math.abs(amount);

  if (options?.compact && abs >= 1000) {
    const prefix = options.showSign && amount > 0 ? "+" : amount < 0 ? "-" : "";
    return `${prefix}${new Intl.NumberFormat(locale, {
      currency,
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
      style: "currency",
    }).format(abs / 1000)}k`;
  }

  const formatted = new Intl.NumberFormat(locale, {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
    style: "currency",
  }).format(abs);

  if (options?.showSign && amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}
