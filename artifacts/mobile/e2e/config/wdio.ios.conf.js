// @ts-check
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");

// Release build has embedded JS bundle (no Metro needed).
// Debug build requires Metro running on localhost:8081.
const DERIVED_DATA = `${process.env.HOME}/Library/Developer/Xcode/DerivedData/SpendWise-bqaioljonzxvgifjzannfohxhrtk`;
const APP_PATH =
  process.env.APP_PATH ||
  `${DERIVED_DATA}/Build/Products/Release-iphonesimulator/SpendWise.app`;

/** @type {import('@wdio/types').Options.Testrunner} */
exports.config = {
  runner: "local",

  specs: [path.join(ROOT, "e2e/specs/**/*.spec.ts")],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: "iOS",
      "appium:platformVersion": "26.0",
      "appium:deviceName": "iPhone 17 Pro",
      "appium:udid": "808879C2-A04B-457D-A994-3313C9DCA1B9",
      "appium:automationName": "XCUITest",
      "appium:app": APP_PATH,
      "appium:bundleId": "org.name.SpendWise",
      "appium:newCommandTimeout": 300,
      "appium:noReset": false,
      "appium:fullReset": false,
      "appium:wdaLaunchTimeout": 120000,
      "appium:wdaConnectionTimeout": 120000,
    },
  ],

  logLevel: "info",
  bail: 0,
  waitforTimeout: 20000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  port: 4723,
  path: "/",

  services: [
    [
      "@wdio/appium-service",
      {
        command: "appium",
        args: {
          relaxedSecurity: true,
          log: path.join(ROOT, "e2e/logs/appium-ios.log"),
        },
      },
    ],
  ],

  framework: "mocha",
  reporters: [["spec", { realtimeReporting: true }]],

  mochaOpts: {
    ui: "bdd",
    timeout: 180000,
  },

  before: async () => {
    await driver.setTimeout({ implicit: 10000 });

    // Wait for the app to render a known root screen.
    // Release build has embedded JS — no Metro needed, app should be fast.
    await driver.setTimeout({ implicit: 0 });
    let appReady = false;
    const start = Date.now();
    while (Date.now() - start < 30000) {
      try {
        const onboardingBtn = await $("~onboarding-get-started-btn");
        if (await onboardingBtn.isDisplayed()) { appReady = true; break; }
      } catch {}
      try {
        const loginBtn = await $("~google-login-btn");
        if (await loginBtn.isDisplayed()) { appReady = true; break; }
      } catch {}
      try {
        const dashBalance = await $("~dashboard-balance");
        if (await dashBalance.isDisplayed()) { appReady = true; break; }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    await driver.setTimeout({ implicit: 10000 });
    if (!appReady) {
      console.warn("[WDIO before] App did not reach a known screen within 30s — tests may fail.");
    } else {
      console.log("[WDIO before] App is ready.");
    }
  },
};
