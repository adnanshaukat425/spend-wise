import { calculateBudgetMetrics, calculateSavingsRate, getBudgetHealthSummary, getBudgetStatusTone } from "./budget";

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
assertEqual(calculateSavingsRate(5000, 3000), 40);
assertEqual(calculateSavingsRate(0, 100), 0);

const health = getBudgetHealthSummary(1000, 950);
assertEqual(health.healthStatus, "Over Budget");
assertEqual(health.healthStatusTone, "danger");
assertEqual(health.spentPercent, 95);
