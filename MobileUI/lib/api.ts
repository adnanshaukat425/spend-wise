export * from "./api/index";
import { setApiBaseUrl, setAuthTokenGetter } from "./api/client";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

export function isApiConfigured(): boolean {
  return API_BASE_URL.length > 0;
}

let tokenGetter: (() => string | null) | null = null;

export function registerAuthTokenGetter(getter: () => string | null): void {
  tokenGetter = getter;
}

export function getAccessToken(): string | null {
  return tokenGetter?.() ?? null;
}

export function initApi(): void {
  if (isApiConfigured()) {
    setApiBaseUrl(API_BASE_URL);
  }
  setAuthTokenGetter(() => getAccessToken());
}
