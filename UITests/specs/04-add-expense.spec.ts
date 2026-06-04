/**
 * 04-add-expense.spec.ts
 *
 * Tests the Add Expense modal: opening the form, filling in fields, and
 * submitting a transaction.
 */

import DashboardPage from "../pages/DashboardPage";
import AddExpensePage from "../pages/AddExpensePage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh, goBack } from "../helpers/wait.helper";

describe("Add Expense", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
  });

  beforeEach(async () => {
    // Only navigate back if we're on neither the dashboard nor the add-expense screen
    const onDashboard = await DashboardPage.isOnScreen();
    const onAddExpense = await AddExpensePage.isOnScreen();
    if (!onDashboard && !onAddExpense) {
      await goBack();
      await DashboardPage.waitForLoad();
    }
  });

  it("should open the Add Expense modal when tapping the FAB", async () => {
    // The FAB uses a custom tabBarButton; tapping the middle tab opens the modal
    const addTab = await $("~add-expense");
    await addTab.click();
    await AddExpensePage.waitForLoad();
    expect(await AddExpensePage.isOnScreen()).toBe(true);
  });

  it("should display the amount input field", async () => {
    expect(await AddExpensePage.amountInput.isDisplayed()).toBe(true);
  });

  it("should keep the submit button disabled when the amount is empty", async () => {
    // Amount starts empty — button should be visually disabled (opacity 0.5)
    const btn = AddExpensePage.submitBtn;
    const enabled = await btn.getAttribute("enabled");
    expect(enabled).not.toBe("true");
  });

  it("should enable the submit button after entering a valid amount", async () => {
    await AddExpensePage.enterAmount("25.00");
    await waitForDataRefresh(500);
    const btn = AddExpensePage.submitBtn;
    const enabled = await btn.getAttribute("enabled");
    expect(enabled).toBe("true");
  });

  it("should accept a note in the note field", async () => {
    await AddExpensePage.enterNote("Coffee with team");
    const note = AddExpensePage.noteInput;
    const value = await note.getValue();
    expect(value).toContain("Coffee");
  });

  it("should submit the expense and close the modal", async () => {
    // Ensure a valid amount is entered
    await AddExpensePage.enterAmount("12.50");
    await waitForDataRefresh(300);
    await AddExpensePage.submit();

    await waitForDataRefresh(2000);
    // After submit the modal closes and dashboard is shown
    const onDashboard = await DashboardPage.isOnScreen();
    expect(onDashboard).toBe(true);
  });
});
