/**
 * 09-subscription.spec.ts
 *
 * Tests the subscription flow: navigating to the subscription screen via the
 * Profile tab, verifying plans load, selecting a plan, and attempting to
 * start the 7-day free trial.
 */

import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import SubscriptionPage from "../pages/SubscriptionPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh, goBack } from "../helpers/wait.helper";

describe("Subscription", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
  });

  it("should navigate to the Profile tab", async () => {
    const profileTab = await $("~tab-profile");
    await profileTab.click();
    await ProfilePage.waitForLoad();
    expect(await ProfilePage.isOnScreen()).toBe(true);
  });

  it("should display the Upgrade to Pro banner on the profile screen", async () => {
    // The upgrade banner may need a scroll to become visible
    let visible = await ProfilePage.isVisible("upgrade-to-pro-btn", 3000);
    for (let i = 0; i < 3 && !visible; i++) {
      await ProfilePage.scrollDown();
      await driver.pause(400);
      visible = await ProfilePage.isVisible("upgrade-to-pro-btn", 2000);
    }
    expect(visible).toBe(true);
  });

  it("should navigate to the subscription screen when tapping Upgrade to Pro", async () => {
    // Scroll until upgrade-to-pro-btn is visible then tap it
    let visible = await ProfilePage.isVisible("upgrade-to-pro-btn", 3000);
    for (let i = 0; i < 3 && !visible; i++) {
      await ProfilePage.scrollDown();
      await driver.pause(400);
      visible = await ProfilePage.isVisible("upgrade-to-pro-btn", 2000);
    }
    await ProfilePage.tapUpgradeToPro();
    await SubscriptionPage.waitForLoad();
    expect(await SubscriptionPage.isOnScreen()).toBe(true);
  });

  it("should display at least one subscription plan card", async () => {
    await driver.waitUntil(
      async () => {
        const plans = await $$('-ios predicate string:name BEGINSWITH "subscription-plan-"');
        return plans.length > 0;
      },
      { timeout: 10000, timeoutMsg: "No subscription plan cards found" },
    );
    const plans = await $$('-ios predicate string:name BEGINSWITH "subscription-plan-"');
    expect(plans.length).toBeGreaterThan(0);
  });

  it("should allow selecting a different plan", async () => {
    const plans = await $$('-ios predicate string:name BEGINSWITH "subscription-plan-"');
    if (plans.length > 1) {
      await plans[1].click();
      await waitForDataRefresh(500);
    }
    // No assertion needed — just verifies no crash on tap
  });

  it("should show the Start Free Trial button", async () => {
    expect(await SubscriptionPage.startTrialBtn.isDisplayed()).toBe(true);
  });

  it("should attempt to start the trial and show a response", async () => {
    await SubscriptionPage.tapStartTrial();
    // Expect either success alert or an error alert — either way the modal/alert appears
    await driver.waitUntil(
      async () => {
        try {
          // iOS: native alert with OK button
          const alert = await driver.getAlertText();
          return alert.length > 0;
        } catch {
          return false;
        }
      },
      { timeout: 12000, timeoutMsg: "No alert appeared after tapping Start Trial" },
    );
    // Dismiss whatever alert appeared
    try {
      await driver.acceptAlert();
    } catch {
      await driver.dismissAlert();
    }
    await waitForDataRefresh(1000);
  });

  it("should return to the profile screen after closing the subscription modal", async () => {
    // The modal was dismissed — navigate back
    const onSub = await SubscriptionPage.isOnScreen();
    if (onSub) {
      await goBack();
    }
    await ProfilePage.waitForLoad();
    expect(await ProfilePage.isOnScreen()).toBe(true);
  });
});
