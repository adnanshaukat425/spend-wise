/**
 * 11-profile.spec.ts
 *
 * Tests the full Profile screen: settings toggles, navigation to child screens,
 * and confirming the sign-out button is present (sign-out flow is tested in 02-auth).
 */

import DashboardPage from "../pages/DashboardPage";
import ProfilePage from "../pages/ProfilePage";
import AccountsPage from "../pages/AccountsPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh, goBack } from "../helpers/wait.helper";

describe("Profile Screen", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
    const profileTab = await $("~tab-profile");
    await profileTab.click();
    await ProfilePage.waitForLoad();
  });

  it("should display the profile screen", async () => {
    expect(await ProfilePage.isOnScreen()).toBe(true);
  });

  it("should display the Upgrade to Pro banner", async () => {
    expect(await ProfilePage.upgradeToPro.isDisplayed()).toBe(true);
  });

  it("should display the dark mode toggle", async () => {
    // Scroll down until the dark mode row is visible (it's below the Upgrade banner)
    let visible = await ProfilePage.isVisible("profile-row-dark", 2000);
    for (let i = 0; i < 4 && !visible; i++) {
      await ProfilePage.scrollDown();
      await driver.pause(400);
      visible = await ProfilePage.isVisible("profile-row-dark", 2000);
    }
    expect(visible).toBe(true);
  });

  it("should toggle dark mode on and off without crashing", async () => {
    // Toggle dark mode
    await ProfilePage.toggleDarkMode();
    await waitForDataRefresh(1200);
    // Verify the app didn't crash — profile screen still exists
    const stillOnProfile = await ProfilePage.isExisting("profile-row-dark");
    expect(stillOnProfile).toBe(true);
    // Toggle back to original state
    await ProfilePage.toggleDarkMode();
    await waitForDataRefresh(1200);
    // Verify still on profile after second toggle
    const backOnProfile = await ProfilePage.isExisting("profile-row-dark");
    expect(backOnProfile).toBe(true);
  });

  it("should display the notifications toggle", async () => {
    let visible = await ProfilePage.isVisible("profile-row-notif", 2000);
    for (let i = 0; i < 2 && !visible; i++) {
      await ProfilePage.scrollDown();
      await driver.pause(400);
      visible = await ProfilePage.isVisible("profile-row-notif", 2000);
    }
    expect(visible).toBe(true);
  });

  it("should toggle notifications on and off without crashing", async () => {
    await ProfilePage.toggleNotifications();
    await waitForDataRefresh(800);
    // Toggle back
    await ProfilePage.toggleNotifications();
    await waitForDataRefresh(800);
  });

  it("should navigate to the Manage Accounts screen from profile", async () => {
    // Scroll back to top first to find the accounts row
    await ProfilePage.scrollUp();
    await driver.pause(400);
    let visible = await ProfilePage.isVisible("profile-row-accounts", 3000);
    for (let i = 0; i < 4 && !visible; i++) {
      await ProfilePage.scrollDown();
      await driver.pause(400);
      visible = await ProfilePage.isVisible("profile-row-accounts", 2000);
    }
    await $("~profile-row-accounts").click();
    await AccountsPage.waitForLoad();
    expect(await AccountsPage.isOnScreen()).toBe(true);
    await goBack();
    await ProfilePage.waitForLoad();
  });

  it("should display the sign-out button", async () => {
    const visible = await ProfilePage.isVisible("sign-out-btn", 5000);
    if (!visible) {
      await ProfilePage.scrollDown();
      await ProfilePage.scrollDown();
    }
    expect(await ProfilePage.signOutBtn.isDisplayed()).toBe(true);
  });
});
