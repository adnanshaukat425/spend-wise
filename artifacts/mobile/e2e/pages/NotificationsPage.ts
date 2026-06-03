import { BasePage } from "./BasePage";

class NotificationsPage extends BasePage {
  get markAllReadBtn() {
    return this.el("mark-all-read-btn");
  }

  notificationRow(id: string) {
    return this.el(`notification-row-${id}`);
  }

  async waitForLoad(timeout = 20000) {
    // The screen is loaded when either the mark-all button appears or the
    // scroll view renders (even if there are no notifications)
    await driver.waitUntil(
      async () => {
        const hasMarkAll = await this.isVisible("mark-all-read-btn", 2000);
        const hasRows = (await $$('[testID*="notification-row-"]')).length > 0;
        return hasMarkAll || hasRows;
      },
      { timeout, timeoutMsg: "Notifications screen did not load" },
    );
  }

  async isOnScreen() {
    const hasMarkAll = await this.isVisible("mark-all-read-btn", 3000);
    const hasRows = (await $$('[testID*="notification-row-"]')).length > 0;
    return hasMarkAll || hasRows;
  }

  async tapMarkAllRead() {
    await this.tap("mark-all-read-btn");
  }

  async tapNotification(id: string) {
    await this.tap(`notification-row-${id}`);
  }

  async getNotificationRows() {
    return $$('[testID*="notification-row-"]');
  }

  async getUnreadCount() {
    const rows = await this.getNotificationRows();
    return rows.length;
  }
}

export default new NotificationsPage();
