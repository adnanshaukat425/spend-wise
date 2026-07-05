import { ApiError } from "@/lib/api/client";

export interface UserFacingError {
  title: string;
  message: string;
  retryable: boolean;
}

export function toUserFacingError(error: unknown, fallbackTitle = "Something went wrong"): UserFacingError {
  if (error instanceof ApiError) {
    return {
      message: error.message,
      retryable: error.status >= 500 || error.status === 408 || error.status === 429,
      title: error.status === 401 ? "Session expired" : fallbackTitle,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      retryable: true,
      title: fallbackTitle,
    };
  }

  return {
    message: "Please try again.",
    retryable: true,
    title: fallbackTitle,
  };
}
