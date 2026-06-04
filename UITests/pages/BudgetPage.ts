import { BasePage } from "./BasePage";

class BudgetPage extends BasePage {
  get totalSpent() {
    return this.el("budget-total-spent");
  }

  get adjustBudgetBtn() {
    return this.el("adjust-budget-btn");
  }

  get addCategoryBtn() {
    return this.el("add-category-btn");
  }

  editCategoryBtn(categoryId: string) {
    return this.el(`edit-category-${categoryId}-btn`);
  }

  async waitForLoad(timeout = 20000) {
    await this.totalSpent.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("budget-total-spent");
  }

  async getTotalSpentText() {
    const elem = await this.waitFor("budget-total-spent");
    return elem.getText();
  }

  private async scrollUntilVisible(testId: string): Promise<boolean> {
    const btn = this.el(testId);

    // Phase 1: gentle swipes until element enters the accessibility tree
    let exists = await btn.isExisting().catch(() => false);
    for (let i = 0; i < 12 && !exists; i++) {
      // velocity=200 is gentle enough to not overshoot but still makes progress
      await driver.execute("mobile: swipe", { direction: "up", velocity: 200 });
      await new Promise((r) => setTimeout(r, 400));
      exists = await btn.isExisting().catch(() => false);
    }

    if (!exists) return false;

    // Phase 2: fine-tune - if element exists but not visible, do micro-swipes
    let displayed = await btn.isDisplayed().catch(() => false);
    for (let i = 0; i < 6 && !displayed; i++) {
      const existsNow = await btn.isExisting().catch(() => false);
      if (!existsNow) {
        // Overshot - scroll back up a little
        await driver.execute("mobile: swipe", { direction: "down", velocity: 150 });
        await new Promise((r) => setTimeout(r, 400));
      } else {
        await driver.execute("mobile: swipe", { direction: "up", velocity: 150 });
        await new Promise((r) => setTimeout(r, 400));
      }
      displayed = await btn.isDisplayed().catch(() => false);
    }

    return exists;
  }

  async tapAdjustBudget() {
    await this.scrollUntilVisible("adjust-budget-btn");
    // click() triggers XCUITest auto-scroll into view if element is in tree
    const btn = this.el("adjust-budget-btn");
    await btn.waitForExist({ timeout: 5000 });
    await btn.click();
  }

  async tapAddCategory() {
    await this.scrollUntilVisible("add-category-btn");
    const btn = this.el("add-category-btn");
    await btn.waitForExist({ timeout: 5000 });
    await btn.click();
  }

  async tapEditCategory(categoryId: string) {
    await this.tap(`edit-category-${categoryId}-btn`);
  }
}

export default new BudgetPage();
