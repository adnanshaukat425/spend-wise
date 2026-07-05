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

export function combineQueryResults(queries: UseQueryResult<unknown>[]) {
  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const error = queries.find((query) => query.isError)?.error ?? null;

  function refetch() {
    return Promise.all(queries.map((query) => query.refetch()));
  }

  return { error, isError, isLoading, refetch };
}
