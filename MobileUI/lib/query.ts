import type { QueryClient } from "@tanstack/react-query";

export const queryKeys = {
  accounts: ["accounts"] as const,
  account: (id: string) => ["account", id] as const,
  budget: ["budget"] as const,
  categories: (type?: string) => ["categories", type ?? "all"] as const,
  dashboard: ["dashboard"] as const,
  insights: ["insights"] as const,
  notifications: (params?: Record<string, unknown>) => ["notifications", params ?? {}] as const,
  preferences: ["preferences"] as const,
  subscriptionPlans: ["subscriptionPlans"] as const,
  transaction: (id: string) => ["transaction", id] as const,
  transactions: (params?: Record<string, unknown>) => ["transactions", params ?? {}] as const,
  weeklySpend: ["weeklySpend"] as const,
};

export function invalidateFinancialQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: queryKeys.budget });
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts });
  queryClient.invalidateQueries({ queryKey: queryKeys.insights });
  queryClient.invalidateQueries({ queryKey: ["notifications"] });
}
