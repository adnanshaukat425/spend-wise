import { BasePage } from "./BasePage";

class ProfilePage extends BasePage {
  get signOutBtn() {
    return this.el("sign-out-btn");
  }

  get darkModeToggle() {
    return this.el("dark-mode-toggle");
  }

  get notificationsToggle() {
    return this.el("notifications-toggle");
  }

  get upgradeToPro() {
    return this.el("upgrade-to-pro-btn");
  }

  async waitForLoad(timeout = 20000) {
    await this.signOutBtn.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("sign-out-btn");
  }

  async tapSignOut() {
    await this.tap("sign-out-btn");
  }

  async tapUpgradeToPro() {
    await this.tap("upgrade-to-pro-btn");
  }

  async toggleDarkMode() {
    await this.tap("dark-mode-toggle");
  }

  async toggleNotifications() {
    await this.tap("notifications-toggle");
  }

  async getDarkModeValue(): Promise<boolean> {
    const toggle = this.el("dark-mode-toggle");
    await toggle.waitForDisplayed({ timeout: 10000 });
    const value = await toggle.getAttribute("value");
    return value === "1" || value === "true";
  }
}

export default new ProfilePage();
