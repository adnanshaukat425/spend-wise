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

  async tapAdjustBudget() {
    await this.tap("adjust-budget-btn");
  }

  async tapAddCategory() {
    await this.tap("add-category-btn");
  }

  async tapEditCategory(categoryId: string) {
    await this.tap(`edit-category-${categoryId}-btn`);
  }
}

export default new BudgetPage();
