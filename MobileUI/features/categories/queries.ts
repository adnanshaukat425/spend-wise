import { useQuery } from "@tanstack/react-query";

import { categoriesApi } from "@/lib/api";
import { queryKeys } from "@/lib/query";
import { mapCategoryOption } from "@/lib/mappers";
import { useApiEnabled } from "@/hooks/api/shared";

export function useCategories(type?: string) {
  const enabled = useApiEnabled();
  return useQuery({
    queryKey: queryKeys.categories(type),
    queryFn: async () => (await categoriesApi.list(type)).map(mapCategoryOption),
    enabled,
  });
}
