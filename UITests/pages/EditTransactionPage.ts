import { BasePage } from "./BasePage";

class EditTransactionPage extends BasePage {
  get noteInput() {
    return this.el("note-input");
  }

  get saveBtn() {
    return this.el("edit-transaction-save-btn");
  }

  async waitForLoad(timeout = 20000) {
    // Edit mode shows note-input and the save button — wait for save button
    await this.saveBtn.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("edit-transaction-save-btn");
  }

  async enterNote(note: string) {
    await this.fillInput("note-input", note);
    await this.dismissKeyboard();
  }

  async save() {
    await this.tap("edit-transaction-save-btn");
  }
}

export default new EditTransactionPage();
