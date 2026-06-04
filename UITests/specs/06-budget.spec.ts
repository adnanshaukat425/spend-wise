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
    const budgetTab = await $("~tab-budget");
    await budgetTab.click();
    await BudgetPage.waitForLoad();
  });

  it("should display the budget total spent", async () => {
    expect(await BudgetPage.isOnScreen()).toBe(true);
    const text = await BudgetPage.getTotalSpentText();
    expect(text).toBeTruthy();
  });

  it("should show the Adjust Budget button", async () => {
    // Gentle swipes (low velocity) until the button enters the accessibility tree
    const btn = $("~adjust-budget-btn");
    let exists = await btn.isExisting().catch(() => false);
    for (let i = 0; i < 12 && !exists; i++) {
      await driver.execute("mobile: swipe", { direction: "up", velocity: 200 });
      await driver.pause(400);
      exists = await btn.isExisting().catch(() => false);
    }
    expect(exists).toBe(true);
  });

  it("should open the Adjust Budget modal when tapping the button", async () => {
    await BudgetPage.tapAdjustBudget();
    // Modal title should appear
    await $("~budget-modal-title").waitForDisplayed({ timeout: 8000 });
    const titleText = await $("~budget-modal-title").getText();
    expect(titleText).toBe("Adjust Monthly Budget");
    // Close the modal
    await $("~budget-modal-cancel-btn").click();
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
    await $("~add-category-modal-title").waitForDisplayed({ timeout: 8000 });
    const titleText = await $("~add-category-modal-title").getText();
    expect(titleText).toBe("Add Budget Category");
    await $("~add-category-cancel-btn").click();
    await waitForDataRefresh(500);
  });
});
