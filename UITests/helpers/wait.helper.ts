/**
 * wait.helper.ts
 *
 * Custom explicit-wait wrappers for Appium E2E tests.
 */

/**
 * Wait for a network-driven data update — useful after mutations (create,
 * update, delete) that trigger a refetch via TanStack Query.
 */
export async function waitForDataRefresh(pause = 1500): Promise<void> {
  await driver.pause(pause);
}

/**
 * Navigate back using the ScreenHeader back button (testID="screen-back-btn").
 * Falls back to driver.back() for native modals.
 */
export async function goBack(): Promise<void> {
  try {
    const backBtn = await $("~screen-back-btn");
    if (await backBtn.isDisplayed()) {
      await backBtn.click();
      return;
    }
  } catch {
    // screen-back-btn not present
  }
  await driver.back();
}
