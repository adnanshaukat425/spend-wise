export const DEV_GOOGLE_TOKEN = "dev-google:mobile-user:test@gmail.com";
export const DEV_APPLE_TOKEN = "dev-apple:mobile-user:test@icloud.com";

export function isDevAuthEnabled(): boolean {
  return __DEV__ || process.env.EXPO_PUBLIC_E2E_ENABLED === "1";
}
