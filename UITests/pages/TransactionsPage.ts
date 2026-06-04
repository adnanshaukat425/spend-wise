import { BasePage } from "./BasePage";

class TransactionsPage extends BasePage {
  /**
   * Transaction rows are rendered by TransactionRow component.
   * The testID is set on the parent row using the transaction id.
   */
  transactionRow(id: string) {
    return this.el(`transaction-row-${id}`);
  }

  async waitForLoad(timeout = 20000) {
    await driver.waitUntil(
      async () => {
        const elems = await $$('-ios predicate string:name BEGINSWITH "transaction-row"');
        return elems.length > 0;
      },
      { timeout, timeoutMsg: "No transaction rows found within timeout" },
    );
  }

  async isOnScreen() {
    const elems = await $$('-ios predicate string:name BEGINSWITH "transaction-row"');
    return elems.length > 0;
  }

  async getTransactionRows() {
    return $$('-ios predicate string:name BEGINSWITH "transaction-row"');
  }

  async tapTransaction(id: string) {
    await this.tap(`transaction-row-${id}`);
  }

  async scrollToBottom() {
    await this.scrollDown();
  }
}

export default new TransactionsPage();
