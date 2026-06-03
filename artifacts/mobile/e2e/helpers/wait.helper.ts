/**
 * wait.helper.ts
 *
 * Custom explicit-wait wrappers. Appium is a black-box tool — it has no
 * visibility into the React Native JS thread. All async operations (API calls,
 * animations, navigation transitions) require manual waits. Always prefer
 * these helpers over arbitrary `driver.pause()` calls.
 */

/**
 * Wait until a predicate resolves to a truthy value.
 *
 * @param predicate  Async function returning true when the condition is met.
 * @param timeout    Maximum wait time in ms (default 15 s).
 * @param interval   Poll interval in ms (default 500 ms).
 * @param errorMsg   Custom error message shown on timeout.
 */
export async function waitUntilTrue(
  predicate: () => Promise<boolean>,
  timeout = 15000,
  interval = 500,
  errorMsg = "Condition was not met within the timeout period",
): Promise<void> {
  await driver.waitUntil(predicate, { timeout, interval, timeoutMsg: errorMsg });
}

/**
 * Wait for an element identified by testID to appear and become visible.
 */
export async function waitForElement(
  testId: string,
  timeout = 15000,
): Promise<WebdriverIO.Element> {
  const elem = $(`~${testId}`);
  await elem.waitForDisplayed({ timeout });
  return elem;
}

/**
 * Wait for an element to disappear (e.g. a loading spinner).
 */
export async function waitForElementToHide(
  testId: string,
  timeout = 15000,
): Promise<void> {
  const elem = $(`~${testId}`);
  await elem.waitForDisplayed({ timeout, reverse: true });
}

/**
 * Wait for text to appear inside an element.
 */
export async function waitForText(
  testId: string,
  expectedText: string,
  timeout = 15000,
): Promise<void> {
  await driver.waitUntil(
    async () => {
      try {
        const elem = $(`~${testId}`);
        const text = await elem.getText();
        return text.includes(expectedText);
      } catch {
        return false;
      }
    },
    { timeout, timeoutMsg: `Element ~${testId} did not contain "${expectedText}"` },
  );
}

/**
 * Wait for a network-driven data update — useful after mutations (create,
 * update, delete) that trigger a refetch via TanStack Query.
 * Pauses briefly then waits for the loading spinner to vanish.
 */
export async function waitForDataRefresh(pause = 1500): Promise<void> {
  await driver.pause(pause);
}

/**
 * Retry a flaky assertion up to `attempts` times with a `delay` ms pause
 * between attempts. Returns the result of the last successful call or throws
 * the last error if all attempts fail.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delay = 1000,
): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await driver.pause(delay);
    }
  }
  throw lastErr;
}
