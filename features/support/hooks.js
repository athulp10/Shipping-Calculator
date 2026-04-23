'use strict';

const { Before, After, AfterStep } = require('@cucumber/cucumber');

/**
 * Before each scenario: open a headless Chrome window and navigate to the app.
 */
Before(async function () {
  await this.openBrowser();
  await this.navigateToApp();
});

/**
 * After each scenario: capture a screenshot on failure, then close the browser.
 */
After(async function (scenario) {
  if (scenario.result.status === 'FAILED' && this.driver) {
    try {
      const screenshot = await this.driver.takeScreenshot();
      this.attach(screenshot, 'image/png');
    } catch (_) {
      // Screenshot failed — swallow and continue teardown.
    }
  }
  await this.closeBrowser();
  // Reset world state for the next scenario.
  this.payload = {};
  this.lastResponse = null;
  this.uiResultVisible = false;
});
