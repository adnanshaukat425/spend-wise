import { BasePage } from "./BasePage";

class AccountsPage extends BasePage {
  get totalBalance() {
    return this.el("accounts-total-balance");
  }

  get addAccountBtn() {
    return this.el("add-account-btn");
  }

  accountRow(id: string) {
    return this.el(`account-row-${id}`);
  }

  async waitForLoad(timeout = 20000) {
    await this.totalBalance.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("accounts-total-balance");
  }

  async getTotalBalanceText() {
    const elem = await this.waitFor("accounts-total-balance");
    return elem.getText();
  }

  async tapAddAccount() {
    await this.tap("add-account-btn");
  }

  async getAccountRows() {
    return $$('[testID*="account-row-"]');
  }

  async tapAccount(id: string) {
    await this.tap(`account-row-${id}`);
  }
}

export default new AccountsPage();
