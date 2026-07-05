import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { transactionsApi } from "@/lib/api";
import type {
  CreateTransactionRequest,
  UpdateTransactionRequest,
} from "@/lib/api/types";
import { invalidateFinancialQueries, queryKeys } from "@/lib/query";
import { mapTransaction } from "@/lib/mappers";
import { useApiEnabled } from "@/hooks/api/shared";

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
      invalidateFinancialQueries(qc);
    },
  });
}

export function useUpdateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateTransactionRequest }) =>
      transactionsApi.update(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.transaction(id) });
      invalidateFinancialQueries(qc);
    },
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsApi.remove(id),
    onSuccess: () => {
      invalidateFinancialQueries(qc);
    },
  });
}
