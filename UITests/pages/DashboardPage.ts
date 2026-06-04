import { BasePage } from "./BasePage";

class DashboardPage extends BasePage {
  get balance() {
    return this.el("dashboard-balance");
  }

  get notificationsBtn() {
    return this.el("notifications-btn");
  }

  get accountsBtn() {
    return this.el("accounts-btn");
  }

  get insightsLink() {
    return this.el("insights-link");
  }

  get seeAllTransactionsBtn() {
    return this.el("see-all-transactions-btn");
  }

  get manageBudgetBtn() {
    return this.el("manage-budget-btn");
  }

  async waitForLoad(timeout = 30000) {
    await this.balance.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("dashboard-balance", 10000);
  }

  async getBalanceText() {
    const elem = await this.waitFor("dashboard-balance");
    return elem.getText();
  }

  async tapNotifications() {
    await this.tap("notifications-btn");
  }

  async tapAccounts() {
    await this.tap("accounts-btn");
  }

  async tapSeeAllTransactions() {
    await this.tap("see-all-transactions-btn");
  }

  async tapManageBudget() {
    await this.tap("manage-budget-btn");
  }

  async tapInsights() {
    await this.tap("insights-link");
  }
}

export default new DashboardPage();
