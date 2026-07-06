import { BasePage } from "./BasePage";

class AddAccountPage extends BasePage {
  get nameInput() {
    return this.el("account-name-input");
  }

  get balanceInput() {
    return this.el("account-balance-input");
  }

  get saveBtn() {
    return this.el("save-account-btn");
  }

  accountTypeBtn(type: "checking" | "savings" | "credit") {
    return this.el(`account-type-${type}`);
  }

  async waitForLoad(timeout = 20000) {
    await this.nameInput.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("account-name-input");
  }

  async enterName(name: string) {
    await this.fillInput("account-name-input", name);
    await this.dismissKeyboard();
  }

  async enterBalance(balance: string) {
    await this.fillInput("account-balance-input", balance);
    await this.dismissKeyboard();
  }

  async selectType(type: "checking" | "savings" | "credit") {
    await this.tap(`account-type-${type}`);
  }

  async save() {
    // Dismiss keyboard first (it may be covering the save button)
    await this.dismissKeyboard();
    await new Promise((r) => setTimeout(r, 400));
    await this.tap("save-account-btn");
  }
}

export default new AddAccountPage();
