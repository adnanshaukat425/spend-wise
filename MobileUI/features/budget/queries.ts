import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { budgetApi } from "@/lib/api";
import { invalidateFinancialQueries, queryKeys } from "@/lib/query";
import { mapBudgetCategory, mapBudgetSummary } from "@/lib/mappers";
import { useApiEnabled } from "@/hooks/api/shared";

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
      invalidateFinancialQueries(qc);
    },
  });
}

export function useUpdateBudgetLines() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lines: { categoryId: string; limitAmount: number }[]) =>
      budgetApi.updateLines(lines),
    onSuccess: () => {
      invalidateFinancialQueries(qc);
    },
  });
}
