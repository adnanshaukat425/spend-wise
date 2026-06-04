/**
 * 10-transaction-detail.spec.ts
 *
 * Tests the transaction detail screen: navigating to the transactions list
 * via "See All", tapping a transaction row, verifying the detail screen
 * renders the amount and category, then navigating back.
 */

import DashboardPage from "../pages/DashboardPage";
import TransactionsPage from "../pages/TransactionsPage";
import TransactionDetailPage from "../pages/TransactionDetailPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh } from "../helpers/wait.helper";

describe("Transaction Detail", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
  });

  it("should navigate to the transactions list via 'See All'", async () => {
    await DashboardPage.tapSeeAllTransactions();
    await TransactionsPage.waitForLoad();
    expect(await TransactionsPage.isOnScreen()).toBe(true);
  });

  it("should display at least one transaction row", async () => {
    const rows = await TransactionsPage.getTransactionRows();
    expect(rows.length).toBeGreaterThan(0);
  });

  it("should navigate to the transaction detail screen on row tap", async () => {
    const rows = await TransactionsPage.getTransactionRows();
    await rows[0].click();
    await TransactionDetailPage.waitForLoad();
    expect(await TransactionDetailPage.isOnScreen()).toBe(true);
  });

  it("should display the transaction amount on the detail screen", async () => {
    const amountText = await TransactionDetailPage.getAmountText();
    expect(amountText).toBeTruthy();
    expect(amountText.length).toBeGreaterThan(0);
  });

  it("should display the transaction category on the detail screen", async () => {
    const category = TransactionDetailPage.category;
    expect(await category.isDisplayed()).toBe(true);
    const text = await category.getText();
    expect(text.length).toBeGreaterThan(0);
  });

  it("should navigate back to the transactions list", async () => {
    await TransactionDetailPage.goBack();
    await waitForDataRefresh(800);
    // Either back on transactions list or on dashboard
    const onTransactions = await TransactionsPage.isOnScreen();
    const onDashboard = await DashboardPage.isOnScreen();
    expect(onTransactions || onDashboard).toBe(true);
  });
});
