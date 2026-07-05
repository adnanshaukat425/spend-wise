export function getCurrentMonthPeriod(reference = new Date()) {
  const startsAt = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const endsAt = new Date(reference.getFullYear(), reference.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    startsAt,
    endsAt,
    label: startsAt.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
  };
}

export function getDaysRemainingInPeriod(period = getCurrentMonthPeriod(), now = new Date()): number {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const remaining = Math.ceil((period.endsAt.getTime() - now.getTime()) / oneDayMs);
  return Math.max(0, remaining);
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

export function formatRelativeTransactionDate(date = new Date(), now = new Date()): string {
  if (isSameCalendarDay(date, now)) {
    return `Today, ${formatTransactionTime(date)}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameCalendarDay(date, yesterday)) {
    return `Yesterday, ${formatTransactionTime(date)}`;
  }

  return date.toLocaleDateString("en-US", {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  });
}

export function formatTransactionTime(date = new Date()): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
