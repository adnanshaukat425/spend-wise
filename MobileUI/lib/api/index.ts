export * from "./client";
export * from "./types";

import Constants from "expo-constants";

import { setApiBaseUrl } from "./client";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;

export function getApiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_URL ?? extra?.apiUrl ?? "";
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().trim().length > 0;
}

export function initApi(): void {
  const apiUrl = getApiBaseUrl();
  if (apiUrl) {
    setApiBaseUrl(apiUrl);
  }
}
