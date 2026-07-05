// @ts-check
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const MOBILE_ROOT = path.resolve(ROOT, "../MobileUI");

const APP_PATH =
  process.env.APP_PATH || path.join(MOBILE_ROOT, "build/SpendWise.app");

/** @type {import('@wdio/types').Options.Testrunner} */
exports.config = {
  runner: "local",

  specs: [path.join(ROOT, "specs/**/*.spec.ts")],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: "iOS",
      "appium:platformVersion": "26.0",
      "appium:deviceName": "iPhone 17 Pro",
      "appium:automationName": "XCUITest",
      "appium:app": APP_PATH,
      "appium:bundleId": "com.adnanshaukat425.mobile",
      "appium:newCommandTimeout": 300,
      "appium:noReset": false,
      "appium:fullReset": true,
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
          log: path.join(ROOT, "logs/appium-ios.log"),
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

    await driver.setTimeout({ implicit: 0 });
    let appReady = false;
    const start = Date.now();
    while (Date.now() - start < 30000) {
      try {
        const onboardingBtn = await $("~onboarding-get-started-btn");
        if (await onboardingBtn.isDisplayed()) {
          appReady = true;
          break;
        }
      } catch {}
      try {
        const loginBtn = await $("~google-login-btn");
        if (await loginBtn.isDisplayed()) {
          appReady = true;
          break;
        }
      } catch {}
      try {
        const dashBalance = await $("~dashboard-balance");
        if (await dashBalance.isDisplayed()) {
          appReady = true;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 500));
    }
    await driver.setTimeout({ implicit: 10000 });
    if (!appReady) {
      console.warn(
        "[WDIO before] App did not reach a known screen within 30s — tests may fail.",
      );
    } else {
      console.log("[WDIO before] App is ready.");
    }
  },
};
