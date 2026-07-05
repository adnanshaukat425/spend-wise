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

export function calculateSavingsRate(monthlyIncome: number, monthlyExpenses: number): number {
  if (monthlyIncome <= 0) return 0;
  return Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100);
}

export interface BudgetHealthSummary {
  healthStatus: string;
  healthStatusTone: "success" | "warning" | "danger";
  message: string;
  spentPercent: number | null;
}

export function getBudgetHealthSummary(
  totalBudget: number,
  totalSpent: number,
): BudgetHealthSummary {
  if (totalBudget <= 0) {
    return {
      healthStatus: "Good Standing",
      healthStatusTone: "success",
      message:
        "Connect your accounts and set a budget to see personalized health insights.",
      spentPercent: null,
    };
  }

  const metrics = calculateBudgetMetrics({ totalBudget, totalSpent });
  const tone = getBudgetStatusTone(metrics);

  const healthStatus =
    metrics.spentPercent >= 90
      ? "Over Budget"
      : metrics.spentPercent >= 70
        ? "On Track"
        : "Good Standing";

  const message =
    metrics.spentPercent >= 90
      ? `You've used ${metrics.spentPercent}% of your monthly budget. Consider reviewing your spending.`
      : metrics.spentPercent >= 70
        ? `You've used ${metrics.spentPercent}% of your monthly budget this month — keep an eye on it.`
        : `Your spending is ${100 - metrics.spentPercent}% below your monthly budget. Great work!`;

  return {
    healthStatus,
    healthStatusTone: tone,
    message,
    spentPercent: metrics.spentPercent,
  };
}
