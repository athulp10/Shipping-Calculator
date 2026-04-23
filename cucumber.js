'use strict';

/**
 * Cucumber.js configuration.
 *
 * Required packages (add to devDependencies):
 *   @cucumber/cucumber   ^10.x
 *   selenium-webdriver   ^4.x
 *   chromedriver         ^114.x  (or whichever matches your installed Chrome)
 *   axios                ^1.x
 *
 * Install:
 *   npm install --save-dev @cucumber/cucumber selenium-webdriver chromedriver axios
 *
 * Run all scenarios:
 *   npx cucumber-js
 *
 * Run in headed mode (shows the browser window):
 *   HEADLESS=false npx cucumber-js
 *
 * Run against a non-local server:
 *   BASE_URL=https://staging.example.com npx cucumber-js
 *
 * Run a specific scenario by tag (add @smoke to scenario in .feature):
 *   npx cucumber-js --tags @smoke
 */
module.exports = {
  default: {
    // Load support files (World + hooks) before step definitions.
    require: [
      'features/support/**/*.js',
      'features/step-definitions/**/*.js',
    ],

    // Target feature files.
    paths: ['features/**/*.feature'],

    // Output formats.
    format: [
      'progress-bar',                          // concise terminal output
      'html:reports/cucumber-report.html',     // full HTML report
      'json:reports/cucumber-report.json',     // machine-readable report
    ],

    // Fail fast after first failure (remove for CI where all results are needed).
    // failFast: true,

    // Retry flaky scenarios once before marking them as failed.
    retry: 1,
  },
};
