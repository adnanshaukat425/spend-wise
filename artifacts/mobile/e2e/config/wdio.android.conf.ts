import type { Options } from "@wdio/types";
import path from "path";

const APP_PATH = path.resolve(__dirname, "../../build/SpendWise.apk");

export const config: Options.Testrunner = {
  runner: "local",
  autoCompileOpts: {
    autoCompile: true,
    tsNodeOpts: {
      project: path.resolve(__dirname, "../../tsconfig.e2e.json"),
      transpileOnly: true,
    },
  },

  specs: ["./e2e/specs/**/*.spec.ts"],
  exclude: [],

  maxInstances: 1,

  capabilities: [
    {
      platformName: "Android",
      "appium:platformVersion": "14",
      "appium:deviceName": "Pixel_7_API_34",
      "appium:automationName": "UiAutomator2",
      "appium:app": APP_PATH,
      "appium:appPackage": "com.spendwise.mobile",
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
          log: "./e2e/logs/appium-android.log",
        },
      },
    ],
  ],

  framework: "mocha",
  reporters: [
    "spec",
    [
      "junit",
      {
        outputDir: "./e2e/reports",
        outputFileFormat: (options: { cid: string }) =>
          `android-results-${options.cid}.xml`,
      },
    ],
  ],

  mochaOpts: {
    ui: "bdd",
    timeout: 60000,
  },

  before: async () => {
    await driver.setImplicitTimeout(10000);
  },
};
