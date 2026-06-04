import { BasePage } from "./BasePage";

class ProfilePage extends BasePage {
  get signOutBtn() {
    return this.el("sign-out-btn");
  }

  get darkModeToggle() {
    return this.el("profile-row-dark");
  }

  get notificationsToggle() {
    return this.el("profile-row-notif");
  }

  get upgradeToPro() {
    return this.el("upgrade-to-pro-btn");
  }

  async waitForLoad(timeout = 30000) {
    // Wait for the profile header to exist (it might be off-screen if scrolled)
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      try {
        const header = await this.el("profile-header-title");
        if (await header.isExisting()) {
          // Scroll to top to make it visible
          await driver.execute("mobile: swipe", { direction: "down", velocity: 800 }).catch(() => {});
          await new Promise((r) => setTimeout(r, 300));
          if (await header.isDisplayed()) return;
          // Try once more after scroll
          await driver.execute("mobile: swipe", { direction: "down", velocity: 800 }).catch(() => {});
          await new Promise((r) => setTimeout(r, 300));
          return;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  async isOnScreen() {
    // Check if profile header exists (may not be visible if scrolled)
    return this.isExisting("profile-header-title");
  }

  async tapSignOut() {
    // Wait for profile to be loaded, then scroll down to sign-out
    await this.waitForLoad(20000);
    // Scroll down until sign-out is visible
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        const soBtn = await this.signOutBtn;
        if (await soBtn.isDisplayed()) {
          await soBtn.click();
          return;
        }
      } catch {}
      await driver.execute("mobile: swipe", { direction: "up", velocity: 400 }).catch(() => {});
      await new Promise((r) => setTimeout(r, 500));
    }
    // Final attempt
    await (await this.signOutBtn).click();
  }

  async tapUpgradeToPro() {
    await this.tap("upgrade-to-pro-btn");
  }

  /** Find the Dark Mode switch using class chain inside the row (bypasses accessibility collapsing) */
  private async findSwitchInRow(rowTestId: string) {
    try {
      // Strategy 1: Find by identifier predicate (works if NOT collapsed)
      const byId = $(`-ios predicate string:identifier == "${rowTestId === "profile-row-dark" ? "dark-mode-toggle" : "notifications-toggle"}"`);
      if (await byId.waitForExist({ timeout: 3000 }).catch(() => false)) {
        return byId;
      }
    } catch {}
    try {
      // Strategy 2: Find Switch type inside the row element via class chain
      const row = await $(`~${rowTestId}`);
      const sw = await row.$("-ios class chain:**/XCUIElementTypeSwitch");
      if (await sw.isExisting()) {
        return sw;
      }
    } catch {}
    return null;
  }

  async toggleDarkMode() {
    // The parent row's onPress handles the toggle — just tap the row
    await this.tap("profile-row-dark");
  }

  async toggleNotifications() {
    await this.tap("profile-row-notif");
  }

  async getDarkModeValue(): Promise<boolean> {
    try {
      const sw = await this.findSwitchInRow("profile-row-dark");
      if (sw) {
        const value = await sw.getAttribute("value");
        return value === "1" || value === "true";
      }
    } catch {}
    return false;
  }

  async getNotificationsValue(): Promise<boolean> {
    try {
      const sw = await this.findSwitchInRow("profile-row-notif");
      if (sw) {
        const value = await sw.getAttribute("value");
        return value === "1" || value === "true";
      }
    } catch {}
    return false;
  }
}

export default new ProfilePage();
