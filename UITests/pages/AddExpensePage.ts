import { BasePage } from "./BasePage";

class AddExpensePage extends BasePage {
  get amountInput() {
    return this.el("amount-input");
  }

  get noteInput() {
    return this.el("note-input");
  }

  get submitBtn() {
    return this.el("add-expense-submit-btn");
  }

  get accountPicker() {
    return this.el("account-picker");
  }

  get accountSelectModal() {
    return this.el("account-select-modal");
  }

  accountSelectRow(id: string) {
    return this.el(`account-select-row-${id}`);
  }

  async openAccountPicker() {
    const picker = this.accountPicker;
    const emptyPicker = this.el("account-picker-empty");
    const hasPicker = await picker.isExisting().catch(() => false);
    if (hasPicker) {
      await picker.click();
      return;
    }
    await emptyPicker.waitForDisplayed({ timeout: 10000 });
    await emptyPicker.click();
  }

  async waitForAccountSelectModal(timeout = 10000) {
    await this.accountSelectModal.waitForDisplayed({ timeout });
  }

  async getAccountSelectRows() {
    return $$('-ios predicate string:name BEGINSWITH "account-select-row-"');
  }

  async selectFirstAccount() {
    const rows = await this.getAccountSelectRows();
    if (rows.length === 0) {
      throw new Error("No account rows found in select modal");
    }
    await rows[0].click();
  }

  async closeAccountSelectModal() {
    await this.tap("account-select-close-btn");
  }

  async waitForLoad(timeout = 20000) {
    await this.amountInput.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isExisting("add-expense-modal-title") || this.isExisting("amount-input");
  }

  async enterAmount(amount: string) {
    const amountEl = this.el("amount-input");
    await amountEl.waitForExist({ timeout: 10000 });
    await amountEl.click();
    await new Promise((r) => setTimeout(r, 300));
    await amountEl.clearValue();
    await amountEl.setValue(amount);
    await new Promise((r) => setTimeout(r, 300));
  }

  async enterNote(note: string) {
    const noteEl = this.el("note-input");
    await noteEl.waitForExist({ timeout: 15000 });
    await noteEl.click();
    await new Promise((r) => setTimeout(r, 400));
    await noteEl.clearValue();
    await noteEl.setValue(note);
    const amountEl = this.el("amount-input");
    const amountExists = await amountEl.isExisting().catch(() => false);
    if (amountExists) {
      try {
        await amountEl.click();
        await new Promise((r) => setTimeout(r, 300));
        await this.dismissKeyboard();
        await new Promise((r) => setTimeout(r, 300));
      } catch {}
    }
  }

  async submit() {
    await this.dismissKeyboard();
    await new Promise((r) => setTimeout(r, 800));
    await this.tap("add-expense-submit-btn");
  }
}

export default new AddExpensePage();
