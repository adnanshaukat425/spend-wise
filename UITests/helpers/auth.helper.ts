/**
 * auth.helper.ts
 *
 * Reusable utilities for authentication flows in Appium tests.
 * Uses the E2E/dev token bypass wired into login.tsx.
 */

import OnboardingPage from "../pages/OnboardingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";

/**
 * Complete onboarding (if shown) and sign in with the dev Google token.
 */
export async function loginWithGoogle(): Promise<void> {
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

  if (screen === "dashboard") {
    return;
  }

  if (screen === "onboarding") {
    await OnboardingPage.tapGetStarted();
    await LoginPage.waitForLoad();
  }

  await LoginPage.loginWithGoogle();
  await DashboardPage.waitForLoad();
}

/**
 * Sign out from the Profile tab and assert the login screen appears.
 */
export async function logout(): Promise<void> {
  const tabBar = await $$("~Profile");
  if (tabBar.length > 0) {
    await tabBar[0].click();
  } else {
    await ProfilePage.waitForLoad();
  }

  await ProfilePage.tapSignOut();

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
