/**
 * 06-budget.spec.ts
 *
 * Tests the Budget tab: viewing category cards, adjusting the total budget,
 * and adding a new budget category.
 */

import DashboardPage from "../pages/DashboardPage";
import BudgetPage from "../pages/BudgetPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh } from "../helpers/wait.helper";

describe("Budget", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
    // Navigate to the Budget tab
    const budgetTab = await $("~Budget");
    await budgetTab.click();
    await BudgetPage.waitForLoad();
  });

  it("should display the budget total spent", async () => {
    expect(await BudgetPage.isOnScreen()).toBe(true);
    const text = await BudgetPage.getTotalSpentText();
    expect(text).toBeTruthy();
  });

  it("should show the Adjust Budget button", async () => {
    // May need to scroll down to reach the Quick Actions card
    const visible = await BudgetPage.isVisible("adjust-budget-btn", 5000);
    if (!visible) {
      await BudgetPage.scrollDown();
    }
    expect(await BudgetPage.adjustBudgetBtn.isDisplayed()).toBe(true);
  });

  it("should open the Adjust Budget modal when tapping the button", async () => {
    await BudgetPage.tapAdjustBudget();
    // Modal title should appear
    const title = await $("~Adjust Monthly Budget");
    const fallback = await driver.waitUntil(
      async () => {
        const elems = await $$('[text="Adjust Monthly Budget"]');
        return elems.length > 0;
      },
      { timeout: 8000, timeoutMsg: "Adjust Budget modal did not open" },
    );
    expect(fallback).toBeTruthy();
    // Close the modal
    const cancelBtn = await $("~Cancel");
    await cancelBtn.click();
    await waitForDataRefresh(500);
  });

  it("should show the Add Category button", async () => {
    const visible = await BudgetPage.isVisible("add-category-btn", 5000);
    if (!visible) {
      await BudgetPage.scrollDown();
    }
    expect(await BudgetPage.addCategoryBtn.isDisplayed()).toBe(true);
  });

  it("should open the Add Category modal", async () => {
    await BudgetPage.tapAddCategory();
    await driver.waitUntil(
      async () => {
        const elems = await $$('[text="Add Budget Category"]');
        return elems.length > 0;
      },
      { timeout: 8000, timeoutMsg: "Add Budget Category modal did not open" },
    );
    const cancelBtn = await $("~Cancel");
    await cancelBtn.click();
    await waitForDataRefresh(500);
  });
});
