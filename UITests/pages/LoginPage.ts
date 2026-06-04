import { BasePage } from "./BasePage";

class LoginPage extends BasePage {
  get googleLoginBtn() {
    return this.el("google-login-btn");
  }

  get appleLoginBtn() {
    return this.el("apple-login-btn");
  }

  get emailLoginBtn() {
    return this.el("email-login-btn");
  }

  async waitForLoad(timeout = 20000) {
    await this.googleLoginBtn.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("google-login-btn");
  }

  async loginWithGoogle() {
    await this.tap("google-login-btn");
  }

  async loginWithApple() {
    await this.tap("apple-login-btn");
  }

  async loginWithEmail() {
    await this.tap("email-login-btn");
  }
}

export default new LoginPage();
