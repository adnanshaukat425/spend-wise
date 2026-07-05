import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { accountsApi } from "@/lib/api";
import type { CreateAccountRequest } from "@/lib/api/types";
import { invalidateFinancialQueries, queryKeys } from "@/lib/query";
import { mapAccount } from "@/lib/mappers";
import { useApiEnabled } from "@/hooks/api/shared";

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
      invalidateFinancialQueries(qc);
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.remove(id),
    onSuccess: () => {
      invalidateFinancialQueries(qc);
    },
  });
}
