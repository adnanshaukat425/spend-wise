import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { usersApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { mapPreferences } from "@/lib/mappers";
import { useApiEnabled } from "@/hooks/api/shared";

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
