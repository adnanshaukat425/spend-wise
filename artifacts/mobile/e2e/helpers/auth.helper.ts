/**
 * auth.helper.ts
 *
 * Reusable utilities for authentication flows in Appium tests.
 * All sign-in helpers use the __DEV__ token bypass that is already wired into
 * login.tsx (DEV_GOOGLE_TOKEN / DEV_APPLE_TOKEN), so no real OAuth round-trip
 * is needed during E2E tests.
 */

import OnboardingPage from "../pages/OnboardingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";

/**
 * Complete the first-run onboarding and sign in with the dev Google token.
 * Handles all three states:
 *   - Fresh install: shows onboarding → login
 *   - Onboarded but not authed: shows login directly
 *   - Already authed (AsyncStorage persisted): shows dashboard directly
 */
export async function loginWithGoogle(): Promise<void> {
  // Use zero implicit timeout so isDisplayed() returns immediately without waiting
  await driver.setTimeout({ implicit: 0 });

  let screen: string | null = null;
  try {
    screen = await driver.waitUntil(
      async () => {
        const onDashboard = await DashboardPage.balance.isDisplayed().catch(() => false);
        if (onDashboard) return "dashboard";
        const onLogin = await LoginPage.googleLoginBtn.isDisplayed().catch(() => false);
        if (onLogin) return "login";
        const onOnboarding = await OnboardingPage.getStartedBtn.isDisplayed().catch(() => false);
        if (onOnboarding) return "onboarding";
        return null;
      },
      { timeout: 45000, interval: 500, timeoutMsg: "App did not reach a known screen within 45s" },
    );
  } finally {
    // Restore implicit timeout for the rest of the test
    await driver.setTimeout({ implicit: 10000 });
  }

  if (screen === "dashboard") {
    return; // Already authenticated
  }

  if (screen === "onboarding") {
    await OnboardingPage.tapGetStarted();
    await LoginPage.waitForLoad();
  }

  await LoginPage.loginWithGoogle();
  await DashboardPage.waitForLoad();
}

/**
 * Sign in with the dev Apple token (useful for Apple-specific flow tests).
 */
export async function loginWithApple(): Promise<void> {
  await driver.setTimeout({ implicit: 0 });

  let screen: string | null = null;
  try {
    screen = await driver.waitUntil(
      async () => {
        const onDashboard = await DashboardPage.balance.isDisplayed().catch(() => false);
        if (onDashboard) return "dashboard";
        const onLogin = await LoginPage.googleLoginBtn.isDisplayed().catch(() => false);
        if (onLogin) return "login";
        const onOnboarding = await OnboardingPage.getStartedBtn.isDisplayed().catch(() => false);
        if (onOnboarding) return "onboarding";
        return null;
      },
      { timeout: 45000, interval: 500, timeoutMsg: "App did not reach a known screen within 45s" },
    );
  } finally {
    await driver.setTimeout({ implicit: 10000 });
  }

  if (screen === "dashboard") return;

  if (screen === "onboarding") {
    await OnboardingPage.tapGetStarted();
    await LoginPage.waitForLoad();
  }

  await LoginPage.loginWithApple();
  await DashboardPage.waitForLoad();
}

/**
 * Sign out from the Profile tab and assert the login screen appears.
 */
export async function logout(): Promise<void> {
  // Navigate to the Profile tab by tapping the last tab bar item
  const tabBar = await $$("~Profile");
  if (tabBar.length > 0) {
    await tabBar[0].click();
  } else {
    // Fall back: scroll to bottom and look for sign-out
    await ProfilePage.waitForLoad();
  }

  await ProfilePage.tapSignOut();

  // The native alert has "Sign Out" confirm button
  const confirmBtn = await driver.waitUntil(
    async () => {
      const btns = await $$("~Sign Out");
      return btns.length > 0 ? btns[0] : null;
    },
    { timeout: 10000, timeoutMsg: "Sign Out confirmation dialog did not appear" },
  );
  await (confirmBtn as WebdriverIO.Element).click();

  await LoginPage.waitForLoad();
}

/**
 * Reset the app to its initial state (signed out) by clearing app data
 * and relaunching. Uses Appium's clearApp to remove AsyncStorage/Keychain data.
 */
export async function resetApp(bundleId: string): Promise<void> {
  await driver.terminateApp(bundleId);
  // Clear app data (AsyncStorage, auth tokens) without uninstalling
  try {
    // @ts-ignore — clearApp is available in appium-xcuitest-driver
    await driver.clearApp();
  } catch {
    // May not be supported — fall back to terminate/activate
  }
  await driver.activateApp(bundleId);
  await new Promise((r) => setTimeout(r, 2000));
}

/**
 * Sign out the currently authenticated user and return to the login screen.
 */
export async function signOut(): Promise<void> {
  const BUNDLE_ID = "org.name.SpendWise";
  await driver.terminateApp(BUNDLE_ID);
  try {
    // @ts-ignore
    await driver.clearApp();
  } catch {}
  await driver.activateApp(BUNDLE_ID);
}
