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
    return $$('-ios predicate string:name BEGINSWITH "account-row-"');
  }

  async getFirstAccountRowId(): Promise<string> {
    const rows = await this.getAccountRows();
    if (rows.length === 0) {
      throw new Error("No account rows found");
    }

    const testId = await rows[0].getAttribute("name");
    const match = testId?.match(/^account-row-(.+)$/);
    if (!match?.[1]) {
      throw new Error(`Unexpected account row testID: ${testId}`);
    }

    return match[1];
  }

  async tapFirstAccount() {
    const id = await this.getFirstAccountRowId();
    await this.tapAccount(id);
    return id;
  }

  async tapAccount(id: string) {
    await this.tap(`account-row-${id}`);
  }
}

export default new AccountsPage();
