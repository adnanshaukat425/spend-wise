import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { accountsApi } from "@/lib/api";
import type { CreateAccountRequest, UpdateAccountRequest } from "@/lib/api/types";
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

export function useAccount(id: string | undefined) {
  const enabled = useApiEnabled() && Boolean(id);
  return useQuery({
    queryKey: queryKeys.account(id ?? ""),
    queryFn: async () => mapAccount(await accountsApi.get(id!)),
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

export function useUpdateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAccountRequest }) =>
      accountsApi.update(id, body),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: queryKeys.account(id) });
      invalidateFinancialQueries(qc);
    },
  });
}

export function useSetDefaultAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => accountsApi.setDefault(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: queryKeys.account(id) });
      invalidateFinancialQueries(qc);
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, transferIncome }: { id: string; transferIncome?: boolean }) =>
      accountsApi.remove(id, transferIncome ?? false),
    onSuccess: () => {
      invalidateFinancialQueries(qc);
    },
  });
}
