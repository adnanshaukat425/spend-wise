import { BasePage } from "./BasePage";

class AddExpensePage extends BasePage {
  get amountInput() {
    return this.el("amount-input");
  }

  get accountPicker() {
    return this.el("account-picker");
  }

  get noteInput() {
    return this.el("note-input");
  }

  get submitBtn() {
    return this.el("add-expense-submit-btn");
  }

  async waitForLoad(timeout = 20000) {
    await this.amountInput.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("amount-input");
  }

  async enterAmount(amount: string) {
    await this.fillInput("amount-input", amount);
    await this.dismissKeyboard();
  }

  async selectCategory(categoryId: string) {
    const cat = this.el(`category-item-${categoryId}`);
    await cat.waitForDisplayed({ timeout: 10000 });
    await cat.click();
  }

  async enterNote(note: string) {
    await this.fillInput("note-input", note);
    await this.dismissKeyboard();
  }

  async submit() {
    await this.tap("add-expense-submit-btn");
  }

  async isSubmitEnabled() {
    const btn = this.el("add-expense-submit-btn");
    await btn.waitForDisplayed({ timeout: 10000 });
    const opacity = await btn.getCSSProperty("opacity");
    return opacity?.value !== "0.5";
  }
}

export default new AddExpensePage();
