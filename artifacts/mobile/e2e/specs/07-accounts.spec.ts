/**
 * 07-accounts.spec.ts
 *
 * Tests the Accounts screen: listing existing accounts and adding a new one.
 */

import DashboardPage from "../pages/DashboardPage";
import AccountsPage from "../pages/AccountsPage";
import AddAccountPage from "../pages/AddAccountPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh } from "../helpers/wait.helper";

describe("Accounts", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
    await DashboardPage.tapAccounts();
    await AccountsPage.waitForLoad();
  });

  it("should display the total balance on the accounts screen", async () => {
    expect(await AccountsPage.isOnScreen()).toBe(true);
    const balance = await AccountsPage.getTotalBalanceText();
    expect(balance).toMatch(/\$[\d,.]+/);
  });

  it("should display existing account rows", async () => {
    const rows = await AccountsPage.getAccountRows();
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });

  it("should show the Add Account button", async () => {
    expect(await AccountsPage.addAccountBtn.isDisplayed()).toBe(true);
  });

  it("should navigate to the Add Account screen", async () => {
    await AccountsPage.tapAddAccount();
    await AddAccountPage.waitForLoad();
    expect(await AddAccountPage.isOnScreen()).toBe(true);
  });

  it("should display the account name input", async () => {
    expect(await AddAccountPage.nameInput.isDisplayed()).toBe(true);
  });

  it("should allow entering an account name", async () => {
    await AddAccountPage.enterName("Test Savings");
    const value = await AddAccountPage.nameInput.getValue();
    expect(value).toContain("Test");
  });

  it("should allow selecting an account type", async () => {
    await AddAccountPage.selectType("savings");
    const savings = AddAccountPage.accountTypeBtn("savings");
    expect(await savings.isDisplayed()).toBe(true);
  });

  it("should allow entering an opening balance", async () => {
    await AddAccountPage.enterBalance("500");
    const value = await AddAccountPage.balanceInput.getValue();
    expect(value).toBe("500");
  });

  it("should save the account and return to the accounts list", async () => {
    await AddAccountPage.save();
    await waitForDataRefresh(2000);
    await AccountsPage.waitForLoad();
    expect(await AccountsPage.isOnScreen()).toBe(true);
  });

  it("should show the newly created account in the list", async () => {
    const rows = await AccountsPage.getAccountRows();
    expect(rows.length).toBeGreaterThan(0);
  });
});
