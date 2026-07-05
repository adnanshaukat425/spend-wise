import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { notificationsApi } from "@/lib/api";
import type { Notification } from "@/data/types";
import { queryKeys } from "@/lib/query";
import { mapNotification } from "@/lib/mappers";
import { useApiEnabled } from "@/hooks/api/shared";

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
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications() });
      qc.setQueryData<Notification[]>(queryKeys.notifications(), (old) =>
        old?.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification,
        ),
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications() });
      qc.setQueryData<Notification[]>(queryKeys.notifications(), (old) =>
        old?.map((notification) => ({ ...notification, read: true })),
      );
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });
}
