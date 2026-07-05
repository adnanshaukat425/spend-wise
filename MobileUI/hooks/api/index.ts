export { queryKeys } from "@/lib/query";
export { useApiEnabled } from "./shared";

export { useDashboard } from "@/features/dashboard/queries";
export { useWeeklySpend, useInsights } from "@/features/insights/queries";
export {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/queries";
export {
  useTransactions,
  useTransaction,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
} from "@/features/transactions/queries";
export {
  useBudget,
  useUpdateBudgetTotal,
  useUpdateBudgetLines,
} from "@/features/budget/queries";
export {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
} from "@/features/accounts/queries";
export { useCategories } from "@/features/categories/queries";
export {
  usePreferences,
  useUpdatePreferences,
} from "@/features/settings/queries";
export {
  useSubscriptionPlans,
  useStartTrial,
} from "@/features/subscription/queries";
export { useParseVoiceExpense } from "@/features/voice/queries";
