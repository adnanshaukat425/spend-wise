/**
 * 01-onboarding.spec.ts
 *
 * Tests the first-run onboarding experience.
 * The app starts fresh (fullReset: true in capabilities) so onboarding is shown.
 */

import OnboardingPage from "../pages/OnboardingPage";
import LoginPage from "../pages/LoginPage";

describe("Onboarding Flow", () => {
  it("should display the onboarding screen on first launch", async () => {
    const isShown = await OnboardingPage.isOnScreen();
    expect(isShown).toBe(true);
  });

  it("should show the Get Started button", async () => {
    await OnboardingPage.waitForLoad();
    const btn = OnboardingPage.getStartedBtn;
    expect(await btn.isDisplayed()).toBe(true);
  });

  it("should navigate to the login screen after tapping Get Started", async () => {
    await OnboardingPage.tapGetStarted();
    await LoginPage.waitForLoad();
    expect(await LoginPage.isOnScreen()).toBe(true);
  });

  it("should show all three sign-in options on the login screen", async () => {
    expect(await LoginPage.googleLoginBtn.isDisplayed()).toBe(true);
    expect(await LoginPage.appleLoginBtn.isDisplayed()).toBe(true);
    expect(await LoginPage.emailLoginBtn.isDisplayed()).toBe(true);
  });
});
