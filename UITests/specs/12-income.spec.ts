/**
 * 12-income.spec.ts
 *
 * Tests the Income recording flow via the Add Expense modal.
 * Verifies the Income/Expense toggle is present and that submitting
 * an income transaction closes the modal and returns to the dashboard.
 */

import DashboardPage from "../pages/DashboardPage";
import AddExpensePage from "../pages/AddExpensePage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh, goBack } from "../helpers/wait.helper";

describe("Income Recording", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
  });

  beforeEach(async () => {
    const onDashboard = await DashboardPage.isOnScreen();
    const onAddExpense = await AddExpensePage.isOnScreen();
    if (!onDashboard && !onAddExpense) {
      await goBack();
      await DashboardPage.waitForLoad();
    }
  });

  it("should open the Add Expense/Income modal via the FAB", async () => {
    const fab = await $("~add-expense");
    await fab.click();
    await AddExpensePage.waitForLoad();
    expect(await AddExpensePage.isOnScreen()).toBe(true);
  });

  it("should display the Income tab toggle", async () => {
    const incomeToggle = await $("~transaction-type-income");
    const visible = await incomeToggle.isDisplayed().catch(() => false);
    expect(visible).toBe(true);
  });

  it("should switch to Income mode when the Income tab is tapped", async () => {
    const incomeToggle = await $("~transaction-type-income");
    await incomeToggle.click();
    await waitForDataRefresh(500);
    // Verify the modal title now reads "Add Income"
    const titleEl = await $("~add-expense-modal-title");
    const title = await titleEl.getText();
    expect(title).toBe("Add Income");
  });

  it("should allow entering an amount in Income mode", async () => {
    await AddExpensePage.enterAmount("500.00");
    expect(await AddExpensePage.amountInput.isDisplayed()).toBe(true);
  });

  it("should submit the income and close the modal", async () => {
    await AddExpensePage.enterAmount("250.00");
    await waitForDataRefresh(300);
    await AddExpensePage.submit();
    await waitForDataRefresh(2500);
    const onDashboard = await DashboardPage.isOnScreen();
    expect(onDashboard).toBe(true);
  });
});
