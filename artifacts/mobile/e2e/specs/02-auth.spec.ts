/**
 * 02-auth.spec.ts
 *
 * Tests the full authentication lifecycle: login via dev Google token and logout.
 * The app must have EXPO_PUBLIC_API_URL pointing at a running backend.
 */

import OnboardingPage from "../pages/OnboardingPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import { loginWithGoogle, logout } from "../helpers/auth.helper";

describe("Authentication", () => {
  describe("Login", () => {
    it("should land on the onboarding or login screen at startup", async () => {
      const onOnboarding = await OnboardingPage.isOnScreen();
      const onLogin = await LoginPage.isOnScreen();
      expect(onOnboarding || onLogin).toBe(true);
    });

    it("should navigate to login after completing onboarding", async () => {
      const onOnboarding = await OnboardingPage.isOnScreen();
      if (onOnboarding) {
        await OnboardingPage.tapGetStarted();
      }
      await LoginPage.waitForLoad();
      expect(await LoginPage.isOnScreen()).toBe(true);
    });

    it("should sign in with Google dev token and reach the dashboard", async () => {
      const onLogin = await LoginPage.isOnScreen();
      if (!onLogin) {
        await OnboardingPage.tapGetStarted();
        await LoginPage.waitForLoad();
      }
      await LoginPage.loginWithGoogle();
      await DashboardPage.waitForLoad();
      expect(await DashboardPage.isOnScreen()).toBe(true);
    });

    it("should display the user balance on the dashboard after login", async () => {
      const balanceText = await DashboardPage.getBalanceText();
      expect(balanceText).toBeTruthy();
      expect(balanceText.length).toBeGreaterThan(0);
    });
  });

  describe("Logout", () => {
    before(async () => {
      // Ensure we are logged in before testing logout
      const onDashboard = await DashboardPage.isOnScreen();
      if (!onDashboard) {
        await loginWithGoogle();
      }
    });

    it("should show a confirmation dialog when tapping Sign Out", async () => {
      // Navigate to Profile tab
      const profileTab = await $("~Profile");
      await profileTab.click();
      await ProfilePage.waitForLoad();

      await ProfilePage.tapSignOut();

      // Alert should appear
      await driver.waitUntil(
        async () => {
          const btns = await $$("~Sign Out");
          return btns.length > 0;
        },
        { timeout: 10000, timeoutMsg: "Sign Out alert did not appear" },
      );
    });

    it("should return to the login screen after confirming sign out", async () => {
      const confirmBtns = await $$("~Sign Out");
      if (confirmBtns.length > 0) {
        await confirmBtns[confirmBtns.length - 1].click();
      }
      await LoginPage.waitForLoad();
      expect(await LoginPage.isOnScreen()).toBe(true);
    });
  });
});
