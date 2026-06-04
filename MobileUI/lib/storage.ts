import AsyncStorage from "@react-native-async-storage/async-storage";

export const StorageKeys = {
  hasOnboarded: "hasOnboarded",
  themePreference: "themePreference",
} as const;

export async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getString(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function setString(key: string, value: string): Promise<void> {
  await AsyncStorage.setItem(key, value);
}

export async function removeKeys(keys: string[]): Promise<void> {
  await AsyncStorage.multiRemove(keys);
}
