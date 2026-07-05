export const TRIAL_DURATION_LABEL = "7-Day Free Trial";

export const PRO_FEATURES = [
  "Unlimited AI-powered insights",
  "Personalized savings recommendations",
  "Spending predictions and forecasts",
  "Smart budget optimization",
  "Detailed monthly reports",
  "Receipt scanning and auto-categorization",
  "Export data to CSV/PDF",
  "Priority customer support",
  "Custom budget categories",
  "Bill reminders and alerts",
];

export function formatPlanPeriod(billingPeriod: string): string {
  if (billingPeriod === "month") return "/month";
  if (billingPeriod === "year") return "/year";
  if (billingPeriod === "lifetime") return "/one-time";
  return billingPeriod ? `/${billingPeriod}` : "";
}
