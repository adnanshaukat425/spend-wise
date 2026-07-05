import type { UseQueryResult } from "@tanstack/react-query";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ErrorState } from "./ErrorState";
import { ScreenLoading } from "./ScreenLoading";

export function QueryScreenBoundary<T>({
  children,
  empty,
  isEmpty,
  loadingLabel,
  query,
}: {
  children: (data: NonNullable<T>) => React.ReactNode;
  empty?: React.ReactNode;
  isEmpty?: (data: NonNullable<T>) => boolean;
  loadingLabel?: string;
  query: UseQueryResult<T>;
}) {
  if (query.isLoading) {
    return <ScreenLoading label={loadingLabel} />;
  }

  if (query.isError) {
    return (
      <View style={styles.centered}>
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
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
