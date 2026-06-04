import { BasePage } from "./BasePage";

class NotificationsPage extends BasePage {
  get markAllReadBtn() {
    return this.el("mark-all-read-btn");
  }

  notificationRow(id: string) {
    return this.el(`notification-row-${id}`);
  }

  /** iOS Appium: use predicate string for partial name match (CSS testID selectors unsupported) */
  private async findNotificationRows() {
    return $$('-ios predicate string:name BEGINSWITH "notification-row-"');
  }

  async waitForLoad(timeout = 20000) {
    await driver.waitUntil(
      async () => {
        const hasMarkAll = await this.isVisible("mark-all-read-btn", 2000);
        if (hasMarkAll) return true;
        const rows = await this.findNotificationRows().catch(() => []);
        if (rows.length > 0) return true;
        // Empty notifications screen — still valid if notifications header visible
        const hasHeader = await this.isVisible("notifications-screen", 1000);
        return hasHeader;
      },
      { timeout, timeoutMsg: "Notifications screen did not load" },
    );
  }

  async isOnScreen() {
    const hasMarkAll = await this.isVisible("mark-all-read-btn", 3000);
    if (hasMarkAll) return true;
    const rows = await this.findNotificationRows().catch(() => []);
    if (rows.length > 0) return true;
    return this.isVisible("notifications-screen", 2000);
  }

  async tapMarkAllRead() {
    await this.tap("mark-all-read-btn");
  }

  async tapNotification(id: string) {
    await this.tap(`notification-row-${id}`);
  }

  async getNotificationRows() {
    return this.findNotificationRows();
  }

  async getUnreadCount() {
    const rows = await this.getNotificationRows();
    return rows.length;
  }
}

export default new NotificationsPage();
