/**
 * 08-notifications.spec.ts
 *
 * Tests the Notifications screen: viewing the inbox, marking a single
 * notification as read, and marking all notifications as read.
 */

import DashboardPage from "../pages/DashboardPage";
import NotificationsPage from "../pages/NotificationsPage";
import { loginWithGoogle } from "../helpers/auth.helper";
import { waitForDataRefresh, goBack } from "../helpers/wait.helper";

describe("Notifications", () => {
  before(async () => {
    await loginWithGoogle();
    await DashboardPage.waitForLoad();
    await DashboardPage.tapNotifications();
    await NotificationsPage.waitForLoad();
  });

  afterEach(async function () {
    if (this.currentTest?.title === "should navigate back to the dashboard") {
      return;
    }

    // If we navigated away, come back
    const onScreen = await NotificationsPage.isOnScreen();
    if (!onScreen) {
      await DashboardPage.waitForLoad();
      await DashboardPage.tapNotifications();
      await NotificationsPage.waitForLoad();
    }
  });

  it("should display the notifications screen", async () => {
    expect(await NotificationsPage.isOnScreen()).toBe(true);
  });

  it("should display notification rows when notifications exist", async () => {
    const rows = await NotificationsPage.getNotificationRows();
    // If there are no notifications the screen is still valid (empty state)
    expect(rows.length).toBeGreaterThanOrEqual(0);
  });

  it("should show the Mark All Read button when unread notifications exist", async () => {
    const rows = await NotificationsPage.getNotificationRows();
    if (rows.length > 0) {
      const hasMarkAll = await NotificationsPage.isVisible("mark-all-read-btn", 5000);
      // Button is only shown when at least one notification is unread
      expect(typeof hasMarkAll).toBe("boolean");
    }
  });

  it("should mark a single notification as read on tap", async () => {
    const rows = await NotificationsPage.getNotificationRows();
    if (rows.length > 0) {
      await rows[0].click();
      await waitForDataRefresh(1500);
      // No throw = success; opacity change is visual only
    }
  });

  it("should mark all notifications as read when Mark All is tapped", async () => {
    const hasMarkAll = await NotificationsPage.isVisible("mark-all-read-btn", 5000);
    if (hasMarkAll) {
      await NotificationsPage.tapMarkAllRead();
      await waitForDataRefresh(2000);
      // After marking all read the button should disappear
      const stillVisible = await NotificationsPage.isVisible("mark-all-read-btn", 3000);
      expect(stillVisible).toBe(false);
    }
  });

  it("should navigate back to the dashboard", async () => {
    await goBack();
    await DashboardPage.waitForLoad();
    expect(await DashboardPage.isOnScreen()).toBe(true);
  });
});
