import { getCurrentMonthPeriod, getDaysRemainingInPeriod } from "./dates";

export interface BudgetMetricsInput {
  totalBudget: number;
  totalSpent: number;
  daysRemaining?: number;
}

export interface BudgetMetrics {
  remaining: number;
  spentPercent: number;
  dailyAllowance: number;
  isOverspent: boolean;
  daysRemaining: number;
}

export function calculateBudgetMetrics(input: BudgetMetricsInput): BudgetMetrics {
  const period = getCurrentMonthPeriod();
  const daysRemaining = input.daysRemaining ?? getDaysRemainingInPeriod(period);
  const remaining = Math.max(0, input.totalBudget - input.totalSpent);
  const spentPercent =
    input.totalBudget > 0
      ? Math.min(100, Math.round((input.totalSpent / input.totalBudget) * 100))
      : 0;

  return {
    dailyAllowance: daysRemaining > 0 ? remaining / daysRemaining : remaining,
    daysRemaining,
    isOverspent: input.totalSpent > input.totalBudget,
    remaining,
    spentPercent,
  };
}

export function getBudgetStatusTone(metrics: Pick<BudgetMetrics, "isOverspent" | "spentPercent">) {
  if (metrics.isOverspent || metrics.spentPercent >= 100) return "danger";
  if (metrics.spentPercent >= 80) return "warning";
  return "success";
}
