import AsyncStorage from "@react-native-async-storage/async-storage";

import type { UserProfileDto } from "@/lib/api/types";

const KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  expiresAt: "expiresAt",
  user: "authUser",
} as const;

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserProfileDto;
}

export async function getStoredAuth(): Promise<StoredAuth | null> {
  try {
    const [accessToken, refreshToken, expiresAt, userRaw] = await Promise.all([
      AsyncStorage.getItem(KEYS.accessToken),
      AsyncStorage.getItem(KEYS.refreshToken),
      AsyncStorage.getItem(KEYS.expiresAt),
      AsyncStorage.getItem(KEYS.user),
    ]);
    if (!accessToken || !refreshToken || !expiresAt || !userRaw) return null;
    return {
      accessToken,
      refreshToken,
      expiresAt,
      user: JSON.parse(userRaw) as UserProfileDto,
    };
  } catch {
    return null;
  }
}

export async function saveAuth(auth: StoredAuth): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(KEYS.accessToken, auth.accessToken),
    AsyncStorage.setItem(KEYS.refreshToken, auth.refreshToken),
    AsyncStorage.setItem(KEYS.expiresAt, auth.expiresAt),
    AsyncStorage.setItem(KEYS.user, JSON.stringify(auth.user)),
  ]);
}

export async function clearAuth(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

export function isTokenExpired(expiresAt: string): boolean {
  const expires = new Date(expiresAt).getTime();
  return Number.isNaN(expires) || expires <= Date.now() + 60_000;
}
