import { BasePage } from "./BasePage";

class SubscriptionPage extends BasePage {
  get startTrialBtn() {
    return this.el("subscription-start-trial-btn");
  }

  planCard(slug: string) {
    return this.el(`subscription-plan-${slug}`);
  }

  async waitForLoad(timeout = 20000) {
    await this.startTrialBtn.waitForDisplayed({ timeout });
  }

  async isOnScreen() {
    return this.isVisible("subscription-start-trial-btn");
  }

  async selectPlan(slug: string) {
    await this.tap(`subscription-plan-${slug}`);
  }

  async tapStartTrial() {
    await this.tap("subscription-start-trial-btn");
  }

  async getFirstPlanSlug(): Promise<string | null> {
    try {
      const plans = await $$('-ios predicate string:name BEGINSWITH "subscription-plan-"');
      if (plans.length === 0) return null;
      const name = await plans[0].getAttribute("name") as string;
      return name.replace("subscription-plan-", "");
    } catch {
      return null;
    }
  }
}

export default new SubscriptionPage();
