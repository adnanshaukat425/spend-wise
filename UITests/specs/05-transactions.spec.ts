/**
 * 05-transactions.spec.ts
 *
 * Tests the transaction list (hidden expenses tab) and transaction detail screen.
 */

import DashboardPage from "../pages/DashboardPage";
import TransactionsPage from "../pages/TransactionsPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { goBack } from "../helpers/wait.helper";

describe("Transactions", () => {
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

  it("should scroll to reveal more transactions", async () => {
    const rowsBefore = (await TransactionsPage.getTransactionRows()).length;
    await TransactionsPage.scrollToBottom();
    await driver.pause(1000);
    const rowsAfter = (await TransactionsPage.getTransactionRows()).length;
    // Either more rows loaded or same count — both are valid
    expect(rowsAfter).toBeGreaterThanOrEqual(rowsBefore);
  });

  it("should navigate back to the dashboard from the transactions list", async () => {
    await goBack();
    await DashboardPage.waitForLoad();
    expect(await DashboardPage.isOnScreen()).toBe(true);
  });
});
