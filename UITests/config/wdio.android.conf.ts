import type { Options } from "@wdio/types";
import path from "path";

const ROOT = path.resolve(__dirname, "..");
const MOBILE_ROOT = path.resolve(ROOT, "../MobileUI");
const APP_PATH = path.join(MOBILE_ROOT, "build/SpendWise.apk");

export const config: Options.Testrunner = {
  runner: "local",
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: path.join(ROOT, "tsconfig.json"),
      transpileOnly: true,
    },
  },

  specs: [path.join(ROOT, "specs/**/*.spec.ts")],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: "Android",
      "appium:platformVersion": "14",
      "appium:deviceName": "Pixel_7_API_34",
      "appium:automationName": "UiAutomator2",
      "appium:app": APP_PATH,
      "appium:appPackage": "com.adnanshaukat.spendwise",
      "appium:appActivity": ".MainActivity",
      "appium:newCommandTimeout": 300,
      "appium:noReset": false,
      "appium:fullReset": false,
      "appium:autoGrantPermissions": true,
    },
  ],

  logLevel: "info",
  bail: 0,
  waitforTimeout: 15000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  services: [
    [
      "@wdio/appium-service",
      {
        command: "appium",
        args: {
          relaxedSecurity: true,
          log: path.join(ROOT, "logs/appium-android.log"),
        },
      },
    ],
  ],

  framework: "mocha",
  reporters: ["spec"],

  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  before: async () => {
    await driver.setImplicitTimeout(10000);
  },
};
