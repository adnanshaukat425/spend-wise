import React from "react";

import { EmptyState } from "./EmptyState";
import { toUserFacingError } from "@/domain/errors";

export function ErrorState({
  error,
  onRetry,
  title = "Could not load data",
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
}) {
  const display = toUserFacingError(error, title);

  return (
    <EmptyState
      actionLabel={display.retryable && onRetry ? "Try Again" : undefined}
      body={display.message}
      onAction={display.retryable ? onRetry : undefined}
      title={display.title}
    />
  );
}
