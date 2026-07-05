import type { UseQueryResult } from "@tanstack/react-query";

export function useQueryScreenState<T>(query: UseQueryResult<T>) {
  return {
    data: query.data,
    error: query.error,
    isError: query.isError,
    isLoading: query.isLoading,
    isRefetching: query.isFetching && !query.isLoading,
    refetch: query.refetch,
  };
}
