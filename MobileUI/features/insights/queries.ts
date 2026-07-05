import { useQuery } from "@tanstack/react-query";

import { insightsApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { mapInsight, mapWeeklySpend } from "@/lib/mappers";
import { useApiEnabled } from "@/hooks/api/shared";

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
