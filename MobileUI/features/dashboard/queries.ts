import { useQuery } from "@tanstack/react-query";

import { dashboardApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import {
  defaultBudgetSummary,
  mapAccountSpendingSegment,
  mapBudgetCategory,
  mapBudgetSummary,
  mapSpendingSegment,
  mapTransaction,
} from "@/lib/mappers";
import { useApiEnabled } from "@/hooks/api/shared";

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
        spendingByAccount: (data.spendingByAccount ?? []).map((s, i) =>
          mapAccountSpendingSegment(s, i),
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
