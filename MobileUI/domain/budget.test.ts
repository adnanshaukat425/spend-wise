import { calculateBudgetMetrics, getBudgetStatusTone } from "./budget";

function assertEqual<T>(actual: T, expected: T) {
  if (actual !== expected) {
    throw new Error(`Expected ${String(expected)}, received ${String(actual)}`);
  }
}

const metrics = calculateBudgetMetrics({
  daysRemaining: 10,
  totalBudget: 1000,
  totalSpent: 250,
});

assertEqual(metrics.remaining, 750);
assertEqual(metrics.spentPercent, 25);
assertEqual(metrics.dailyAllowance, 75);
assertEqual(getBudgetStatusTone(metrics), "success");
assertEqual(getBudgetStatusTone({ isOverspent: false, spentPercent: 85 }), "warning");
assertEqual(getBudgetStatusTone({ isOverspent: true, spentPercent: 120 }), "danger");
