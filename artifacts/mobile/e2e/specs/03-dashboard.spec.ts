/**
 * 03-dashboard.spec.ts
 *
 * Tests the home/dashboard screen: balance display and quick navigation links.
 */

import DashboardPage from "../pages/DashboardPage";
import AccountsPage from "../pages/AccountsPage";
import NotificationsPage from "../pages/NotificationsPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { goBack } from "../helpers/wait.helper";

describe("Dashboard", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
  });

  it("should display the total balance", async () => {
    const balance = await DashboardPage.getBalanceText();
    expect(balance).toMatch(/\$[\d,.]+/);
  });

  it("should display the notifications button", async () => {
    expect(await DashboardPage.notificationsBtn.isDisplayed()).toBe(true);
  });

  it("should navigate to notifications when tapping the bell", async () => {
    await DashboardPage.tapNotifications();
    await NotificationsPage.waitForLoad();
    expect(await NotificationsPage.isOnScreen()).toBe(true);
    await goBack();
    await DashboardPage.waitForLoad();
  });

  it("should navigate to accounts when tapping the accounts row", async () => {
    await DashboardPage.tapAccounts();
    await AccountsPage.waitForLoad();
    expect(await AccountsPage.isOnScreen()).toBe(true);
    await goBack();
    await DashboardPage.waitForLoad();
  });

  it("should show the See All transactions button", async () => {
    const visible = await DashboardPage.seeAllTransactionsBtn.isDisplayed().catch(() => false);
    if (!visible) {
      await DashboardPage.scrollDown();
    }
    expect(await DashboardPage.seeAllTransactionsBtn.isDisplayed()).toBe(true);
  });

  it("should show the Manage Budget button", async () => {
    const btn = DashboardPage.manageBudgetBtn;
    const visible = await btn.isDisplayed().catch(() => {
      // May require scrolling
      return false;
    });
    if (!visible) {
      await DashboardPage.scrollDown();
    }
    expect(await DashboardPage.manageBudgetBtn.isDisplayed()).toBe(true);
  });
});
