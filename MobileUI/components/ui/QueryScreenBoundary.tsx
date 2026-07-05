import type { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";

import { combineQueryResults } from "@/hooks/useQueryScreenState";

import { ErrorState } from "./ErrorState";
import { ScreenLoading } from "./ScreenLoading";

interface QueryScreenBoundaryBaseProps {
  empty?: React.ReactNode;
  loadingLabel?: string;
  onRetry?: () => void;
}

interface SingleQueryProps<T> extends QueryScreenBoundaryBaseProps {
  children: (data: NonNullable<T>) => React.ReactNode;
  isEmpty?: (data: NonNullable<T>) => boolean;
  queries?: never;
  query: UseQueryResult<T>;
}

interface MultiQueryProps extends QueryScreenBoundaryBaseProps {
  children: React.ReactNode;
  isEmpty?: never;
  queries: UseQueryResult<unknown>[];
  query?: never;
}

export function QueryScreenBoundary<T>({
  children,
  empty,
  isEmpty,
  loadingLabel,
  onRetry,
  queries,
  query,
}: SingleQueryProps<T> | MultiQueryProps) {
  if (queries) {
    const combined = combineQueryResults(queries);

    if (combined.isLoading) {
      return <ScreenLoading label={loadingLabel} />;
    }

    if (combined.isError) {
      return (
        <View style={styles.centered}>
          <ErrorState
            error={combined.error}
            onRetry={() => void (onRetry ? onRetry() : combined.refetch())}
          />
        </View>
      );
    }

    return <>{children}</>;
  }

  if (query.isLoading) {
    return <ScreenLoading label={loadingLabel} />;
  }

  if (query.isError) {
    return (
      <View style={styles.centered}>
        <ErrorState
          error={query.error}
          onRetry={() => void (onRetry ? onRetry() : query.refetch())}
        />
      </View>
    );
  }

  if (query.data === null || query.data === undefined) {
    return <ScreenLoading label={loadingLabel} />;
  }

  if (isEmpty?.(query.data)) {
    return <>{empty ?? null}</>;
  }

  return <>{children(query.data)}</>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
  },
});
