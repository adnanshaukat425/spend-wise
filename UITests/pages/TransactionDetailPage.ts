import { BasePage } from "./BasePage";

class TransactionDetailPage extends BasePage {
  get amount() {
    return this.el("transaction-detail-amount");
  }

  get category() {
    return this.el("transaction-detail-category");
  }

  async waitForLoad(timeout = 20000) {
    await this.amount.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("transaction-detail-amount");
  }

  async getAmountText() {
    const elem = await this.waitFor("transaction-detail-amount");
    return elem.getText();
  }

  async goBack() {
    await super.goBack();
  }
}

export default new TransactionDetailPage();
