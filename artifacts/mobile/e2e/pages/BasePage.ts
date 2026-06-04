/**
 * BasePage provides shared element-finding utilities used by all page objects.
 * Elements are located exclusively via testID (accessibility ID) so tests are
 * insulated from implementation details like class names or XPath.
 */
export class BasePage {
  /**
   * Find an element by its testID (accessibility ID).
   * Prefix `~` tells WebdriverIO to use the accessibility-ID locator strategy,
   * which maps to testID on both iOS (XCUITest) and Android (UiAutomator2).
   */
  protected el(testId: string) {
    return $(`~${testId}`);
  }

  /**
   * Wait for an element to be visible, then return it.
   */
  async waitFor(testId: string, timeout = 15000) {
    const elem = this.el(testId);
    await elem.waitForDisplayed({ timeout });
    return elem;
  }

  /**
   * Tap an element identified by testID after waiting for it to appear.
   */
  async tap(testId: string, timeout = 15000) {
    const elem = await this.waitFor(testId, timeout);
    await elem.click();
  }

  /**
   * Clear a text field and type new text.
   */
  async fillInput(testId: string, text: string, timeout = 15000) {
    const elem = await this.waitFor(testId, timeout);
    await elem.clearValue();
    await elem.setValue(text);
  }

  /**
   * Return true if the element with the given testID is currently visible.
   */
  async isVisible(testId: string, timeout = 5000) {
    try {
      const elem = this.el(testId);
      return await elem.waitForDisplayed({ timeout });
    } catch {
      return false;
    }
  }

  /**
   * Return true if the element with the given testID exists in the accessibility tree
   * (may not be visible/displayed if scrolled off-screen).
   */
  async isExisting(testId: string, timeout = 5000) {
    try {
      const elem = this.el(testId);
      return await elem.waitForExist({ timeout });
    } catch {
      return false;
    }
  }

  /**
   * Scroll down on the screen using mobile: swipe (Appium XCUITest native gesture).
   */
  async scrollDown() {
    await driver.execute("mobile: swipe", { direction: "up", velocity: 800 });
  }

  /**
   * Scroll up on the screen using mobile: swipe (Appium XCUITest native gesture).
   */
  async scrollUp() {
    await driver.execute("mobile: swipe", { direction: "down", velocity: 800 });
  }

  /**
   * Navigate back by tapping the ScreenHeader back button (testID="screen-back-btn").
   * Use this instead of driver.back() since iOS has no hardware back button.
   */
  async goBack() {
    try {
      const backBtn = await $("~screen-back-btn");
      if (await backBtn.isDisplayed()) {
        await backBtn.click();
        return;
      }
    } catch {}
    // Fallback to driver.back() for modals / native screens
    await driver.back();
  }

  /**
   * Dismiss the keyboard — best-effort, never throws.
   * For decimal-pad keyboards (no Return key), we tap above inputs.
   */
  async dismissKeyboard() {
    // Tap at 15% from top — below status bar / header, above most inputs.
    // This is reliable for both decimal-pad and text keyboards on iOS.
    try {
      const size = await driver.getWindowSize();
      const tapY = Math.floor(size.height * 0.15);
      await driver.performActions([
        {
          type: "pointer",
          id: "finger1",
          parameters: { pointerType: "touch" },
          actions: [
            { type: "pointerMove", duration: 0, x: Math.floor(size.width / 2), y: tapY },
            { type: "pointerDown", button: 0 },
            { type: "pause", duration: 50 },
            { type: "pointerUp", button: 0 },
          ],
        },
      ]);
      await new Promise((r) => setTimeout(r, 400));
    } catch {
      // No-op — keyboard state doesn't block assertions
    }
  }
}
