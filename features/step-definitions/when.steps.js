'use strict';

const { When } = require('@cucumber/cucumber');

/**
 * Executes a shipping cost calculation using two complementary strategies:
 *
 * 1. Direct HTTP call via axios (always runs).
 *    Stores the full AxiosResponse in `this.lastResponse` so that Then steps
 *    can assert on HTTP status codes, response headers, and the raw JSON body.
 *
 * 2. Browser form submission via Selenium WebDriver (runs only when the
 *    payload is UI-compatible — see ShippingWorld.isUICompatible()).
 *    Fills the weight/distance inputs, toggles the fragile switch, submits
 *    the form, and waits for the result panel to appear. This lets Then steps
 *    verify what the user actually sees in the browser.
 *
 * Non-UI-compatible payloads (wrong types, negative numbers, missing fields,
 * string "NaN", null values) are tested at the API level only.
 */
When('I request a shipping cost calculation', async function () {
  // ── 1. API call (always) ─────────────────────────────────────────────────
  await this.callApi();

  // ── 2. Browser form submission (UI-compatible payloads only) ─────────────
  if (this.isUICompatible()) {
    await this.submitViaUI();
  }
});
