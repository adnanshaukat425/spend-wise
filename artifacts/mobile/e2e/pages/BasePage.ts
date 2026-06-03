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
   * Scroll down on the screen to reveal off-screen content.
   */
  async scrollDown() {
    const { width, height } = await driver.getWindowSize();
    await driver.touchAction([
      { action: "press", x: width / 2, y: height * 0.7 },
      { action: "moveTo", x: width / 2, y: height * 0.3 },
      { action: "release" },
    ]);
  }

  /**
   * Dismiss the keyboard if it is open (iOS only — Android dismisses on back).
   */
  async dismissKeyboard() {
    if (driver.isIOS) {
      await driver.hideKeyboard();
    } else {
      await driver.pressKeyCode(4); // KEYCODE_BACK
    }
  }
}
