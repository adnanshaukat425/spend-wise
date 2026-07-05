import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { isApiConfigured, subscriptionsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: queryKeys.subscriptionPlans,
    queryFn: () => subscriptionsApi.plans(),
    enabled: isApiConfigured(),
  });
}

export function useStartTrial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => subscriptionsApi.startTrial(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.subscriptionPlans });
      qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
