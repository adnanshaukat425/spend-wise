import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  accountsApi,
  budgetApi,
  categoriesApi,
  dashboardApi,
  insightsApi,
  notificationsApi,
  subscriptionsApi,
  transactionsApi,
  usersApi,
  voiceApi,
} from "@/lib/api";
import type { CreateAccountRequest, CreateTransactionRequest } from "@/lib/api/types";
import { isApiConfigured } from "@/lib/api";
import {
  mapAccount,
  mapBudgetCategory,
  mapBudgetSummary,
  mapCategoryOption,
  mapInsight,
  mapNotification,
  mapPreferences,
  mapSpendingSegment,
  mapTransaction,
  mapWeeklySpend,
  defaultBudgetSummary,
} from "@/lib/mappers";
import { useAuth } from "@/contexts/AuthContext";

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  transactions: (params?: Record<string, unknown>) =>
    ["transactions", params ?? {}] as const,
  transaction: (id: string) => ["transaction", id] as const,
  budget: ["budget"] as const,
  insights: ["insights"] as const,
  weeklySpend: ["weeklySpend"] as const,
  notifications: (params?: Record<string, unknown>) =>
    ["notifications", params ?? {}] as const,
  accounts: ["accounts"] as const,
  categories: (type?: string) => ["categories", type ?? "all"] as const,
  preferences: ["preferences"] as const,
  subscriptionPlans: ["subscriptionPlans"] as const,
  userSubscription: ["userSubscription"] as const,
};

function useApiEnabled() {
  const { isAuthenticated } = useAuth();
  return isApiConfigured() && isAuthenticated;
}

export function useDashboard() {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const data = await dashboardApi.get();
      return {
        raw: data,
        balance: data.balance,
        balanceChangePct: data.balanceChangePct,
        monthlyIncome: data.monthlyIncome,
        monthlyExpenses: data.monthlyExpenses,
        spendingByCategory: data.spendingByCategory.map((s, i) =>
          mapSpendingSegment(s, i),
        ),
        recentTransactions: data.recentTransactions.map(mapTransaction),
        budgetSummary: data.budgetSummary
          ? mapBudgetSummary(data.budgetSummary)
          : defaultBudgetSummary(),
        budgetCategories: data.budgetSummary
          ? data.budgetSummary.lines.map(mapBudgetCategory)
          : [],
      };
    },
    enabled,
  });
}

export function useTransactions(params?: {
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.transactions(params),
    queryFn: async () => {
      const result = await transactionsApi.list({
        categorySlug:
          params?.categorySlug && params.categorySlug !== "All"
            ? params.categorySlug.toLowerCase()
            : undefined,
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 50,
      });
      const items = result.items.map(mapTransaction);
      const totalIncome = items
        .filter((t) => t.amount > 0)
        .reduce((s, t) => s + t.amount, 0);
      const totalExpenses = Math.abs(
        items.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0),
      );
      return { items, totalIncome, totalExpenses, totalCount: result.totalCount };
    },
    enabled,
  });
}

export function useTransaction(id: string | undefined) {
  const enabled = useApiEnabled() && Boolean(id);
  return useQuery({
    queryKey: queryKeys.transaction(id ?? ""),
    queryFn: async () => mapTransaction(await transactionsApi.get(id!)),
    enabled,
  });
}

export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateTransactionRequest) => transactionsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}

export function useBudget() {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.budget,
    queryFn: async () => {
      const data = await budgetApi.current();
      return {
        budgetSummary: mapBudgetSummary(data),
        budgetCategories: data.lines.map(mapBudgetCategory),
        raw: data,
      };
    },
    enabled,
  });
}

export function useUpdateBudgetTotal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (totalLimit: number) => budgetApi.updateTotal(totalLimit),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budget });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateBudgetLines() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lines: { categoryId: string; limitAmount: number }[]) =>
      budgetApi.updateLines(lines),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budget });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useInsights() {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.insights,
    queryFn: async () => (await insightsApi.list()).map(mapInsight),
    enabled,
  });
}

export function useWeeklySpend() {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.weeklySpend,
    queryFn: async () => mapWeeklySpend(await insightsApi.weeklySpend()),
    enabled,
  });
}

export function useNotifications() {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: async () => {
      const result = await notificationsApi.list({ page: 1, pageSize: 50 });
      return result.items.map(mapNotification);
    },
    enabled,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useAccounts() {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: async () => (await accountsApi.list()).map(mapAccount),
    enabled,
  });
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAccountRequest) => accountsApi.create(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.accounts });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCategories(type?: string) {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.categories(type),
    queryFn: async () => (await categoriesApi.list(type)).map(mapCategoryOption),
    enabled,
  });
}

export function usePreferences() {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.preferences,
    queryFn: async () => mapPreferences(await usersApi.preferences()),
    enabled,
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: {
      notificationsEnabled?: boolean;
      currencyCode?: string;
    }) => usersApi.updatePreferences(patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.preferences });
    },
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans,
    queryFn: () => subscriptionsApi.plans(),
    enabled: isApiConfigured(),
  });
}

export function useUserSubscription() {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.userSubscription,
    queryFn: () => subscriptionsApi.me(),
    enabled,
  });
}

export function useStartTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionsApi.startTrial(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.userSubscription });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useParseVoiceExpense() {
  return useMutation({
    mutationFn: (transcript: string) => voiceApi.parse({ transcript }),
  });
}
