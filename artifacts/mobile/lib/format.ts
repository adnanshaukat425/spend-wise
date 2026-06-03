export function formatCurrency(
  amount: number,
  options?: { compact?: boolean; showSign?: boolean },
): string {
  const abs = Math.abs(amount);
  const formatted = options?.compact
    ? abs >= 1000
      ? `$${(abs / 1000).toFixed(1)}k`
      : `$${abs.toFixed(2)}`
    : `$${abs.toLocaleString("en-US", {
        minimumFractionDigits: abs % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      })}`;

  if (options?.showSign && amount !== 0) {
    return amount > 0 ? `+${formatted}` : `-${formatted.replace("$", "$")}`;
  }
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatPercent(value: number, decimals = 0): string {
  return `${value.toFixed(decimals)}%`;
}

export function getCurrentMonthLabel(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatTransactionTime(date = new Date()): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatTransactionDate(date = new Date()): string {
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return `Today, ${formatTransactionTime(date)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return `Yesterday, ${formatTransactionTime(date)}`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
