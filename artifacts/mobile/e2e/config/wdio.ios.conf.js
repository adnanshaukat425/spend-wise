// @ts-check
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");

const APP_PATH =
  process.env.APP_PATH ||
  `${process.env.HOME}/Library/Developer/Xcode/DerivedData/SpendWise-bqaioljonzxvgifjzannfohxhrtk/Build/Products/Debug-iphonesimulator/SpendWise.app`;

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
      "appium:fullReset": true,
      "appium:wdaLaunchTimeout": 120000,
      "appium:wdaConnectionTimeout": 120000,
    },
  ],

  logLevel: "info",
  bail: 0,
  waitforTimeout: 15000,
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
    timeout: 60000,
  },

  before: async () => {
    await driver.setTimeout({ implicit: 10000 });
  },
};
