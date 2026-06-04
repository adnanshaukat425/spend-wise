import { BasePage } from "./BasePage";

class OnboardingPage extends BasePage {
  get getStartedBtn() {
    return this.el("onboarding-get-started-btn");
  }

  async waitForLoad(timeout = 20000) {
    await this.getStartedBtn.waitForDisplayed({ timeout });
  }

  async tapGetStarted() {
    await this.tap("onboarding-get-started-btn");
  }

  async isOnScreen() {
    return this.isVisible("onboarding-get-started-btn");
  }
}

export default new OnboardingPage();
