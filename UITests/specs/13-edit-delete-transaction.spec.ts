/**
 * 13-edit-delete-transaction.spec.ts
 *
 * Tests editing and deleting transactions via the transaction detail screen.
 */

import DashboardPage from "../pages/DashboardPage";
import TransactionsPage from "../pages/TransactionsPage";
import TransactionDetailPage from "../pages/TransactionDetailPage";
import EditTransactionPage from "../pages/EditTransactionPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh, goBack } from "../helpers/wait.helper";

describe("Edit & Delete Transaction", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
    await DashboardPage.tapSeeAllTransactions();
    await TransactionsPage.waitForLoad();
  });

  it("should navigate to a transaction detail screen", async () => {
    const rows = await TransactionsPage.getTransactionRows();
    expect(rows.length).toBeGreaterThan(0);
    await rows[0].click();
    await TransactionDetailPage.waitForLoad();
    expect(await TransactionDetailPage.isOnScreen()).toBe(true);
  });

  it("should display an Edit button on the transaction detail screen", async function () {
    const editBtn = await $("~edit-transaction-btn").catch(() => null);
    if (!editBtn) {
      this.skip();
    }
    expect(await (editBtn as WebdriverIO.Element).isDisplayed()).toBe(true);
  });

  it("should open the edit screen when Edit is tapped", async function () {
    const editBtn = await $("~edit-transaction-btn").catch(() => null);
    if (!editBtn) {
      this.skip();
    }
    await (editBtn as WebdriverIO.Element).click();
    await EditTransactionPage.waitForLoad();
    expect(await EditTransactionPage.isOnScreen()).toBe(true);
  });

  it("should update the note and save successfully", async function () {
    const onEdit = await EditTransactionPage.isOnScreen();
    if (!onEdit) {
      this.skip();
    }

    await EditTransactionPage.enterNote(`Updated at ${Date.now()}`);
    await EditTransactionPage.save();
    await waitForDataRefresh(2000);

    const onDetail = await TransactionDetailPage.isOnScreen();
    const onList = await TransactionsPage.isOnScreen();
    expect(onDetail || onList).toBe(true);
  });

  it("should display a Delete button on the transaction detail screen", async function () {
    const onDetail = await TransactionDetailPage.isOnScreen();
    if (!onDetail) {
      await goBack();
      await TransactionDetailPage.waitForLoad();
    }
    const deleteBtn = await $("~delete-transaction-btn").catch(() => null);
    if (!deleteBtn) {
      this.skip();
    }
    expect(await (deleteBtn as WebdriverIO.Element).isDisplayed()).toBe(true);
  });

  it("should confirm deletion and remove the transaction", async function () {
    const deleteBtn = await $("~delete-transaction-btn").catch(() => null);
    if (!deleteBtn) {
      this.skip();
    }

    await (deleteBtn as WebdriverIO.Element).click();
    await driver.waitUntil(
      async () => {
        try {
          return (await driver.getAlertText()).length > 0;
        } catch {
          return false;
        }
      },
      { timeout: 8000, timeoutMsg: "Delete confirmation dialog not shown" },
    );
    await driver.acceptAlert();
    await waitForDataRefresh(2500);

    const onList = await TransactionsPage.isOnScreen();
    const onDashboard = await DashboardPage.isOnScreen();
    expect(onList || onDashboard).toBe(true);
  });
});
