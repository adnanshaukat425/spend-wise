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
    // Use isExisting so it returns true even when form is scrolled (not visible)
    return this.isExisting("add-expense-modal-title") || this.isExisting("amount-input");
  }

  async enterAmount(amount: string) {
    const amountEl = this.el("amount-input");
    // iOS XCUITest auto-scrolls elements into view on click, so just click first
    await amountEl.waitForExist({ timeout: 10000 });
    await amountEl.click();
    await new Promise((r) => setTimeout(r, 300));
    await amountEl.clearValue();
    await amountEl.setValue(amount);
    await new Promise((r) => setTimeout(r, 300));
  }

  async selectCategory(categoryId: string) {
    const cat = this.el(`category-item-${categoryId}`);
    await cat.waitForDisplayed({ timeout: 10000 });
    await cat.click();
  }

  async enterNote(note: string) {
    // Use waitForExist (not waitForDisplayed) so we find it even when off-screen
    const noteEl = this.el("note-input");
    await noteEl.waitForExist({ timeout: 15000 });
    // Click the element — iOS XCUITest auto-scrolls it into view when clicked
    await noteEl.click();
    await new Promise((r) => setTimeout(r, 400));
    await noteEl.clearValue();
    await noteEl.setValue(note);
    // After entering note, tap on the amount-input to scroll back to top + dismiss keyboard
    // This brings amount-input into view for the submit test
    const amountEl = this.el("amount-input");
    const amountExists = await amountEl.isExisting().catch(() => false);
    if (amountExists) {
      try {
        await amountEl.click();
        await new Promise((r) => setTimeout(r, 300));
        // Now dismiss decimal keyboard that just opened
        await this.dismissKeyboard();
        await new Promise((r) => setTimeout(r, 300));
      } catch {}
    }
  }

  async submit() {
    // Dismiss keyboard, then wait for it to fully animate out
    await this.dismissKeyboard();
    await new Promise((r) => setTimeout(r, 800));
    // The submit button is in normal document flow (not absolute), so it's
    // always visible once the keyboard is gone
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
