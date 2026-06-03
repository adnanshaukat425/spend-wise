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
 * Handles both fresh installs (shows onboarding) and already-onboarded state.
 */
export async function loginWithGoogle(): Promise<void> {
  const isOnboarding = await OnboardingPage.isOnScreen();
  if (isOnboarding) {
    await OnboardingPage.tapGetStarted();
  }

  await LoginPage.waitForLoad();
  await LoginPage.loginWithGoogle();
  await DashboardPage.waitForLoad();
}

/**
 * Sign in with the dev Apple token (useful for Apple-specific flow tests).
 */
export async function loginWithApple(): Promise<void> {
  const isOnboarding = await OnboardingPage.isOnScreen();
  if (isOnboarding) {
    await OnboardingPage.tapGetStarted();
  }

  await LoginPage.waitForLoad();
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
 * Reset the app to its initial state by terminating and relaunching it.
 * Pass fullReset: true in capabilities to clear storage between suite runs,
 * or use this helper to force-reset within a test file.
 */
export async function resetApp(bundleId: string): Promise<void> {
  await driver.terminateApp(bundleId);
  await driver.activateApp(bundleId);
}
