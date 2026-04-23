'use strict';

/**
 * Custom Cucumber World for the Shipping Calculator test suite.
 *
 * Strategy:
 *  - Every scenario makes a direct HTTP call via axios so that HTTP status
 *    codes and raw JSON response bodies can be asserted.
 *  - When the payload is valid and browser-compatible (non-negative numbers,
 *    boolean fragile flag), Selenium WebDriver also drives the browser form so
 *    that the rendered result panel can be verified in parallel.
 */

const { setWorldConstructor, World } = require('@cucumber/cucumber');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

class ShippingWorld extends World {
  constructor(options) {
    super(options);
    this.baseUrl = BASE_URL;
    this.apiEndpoint = `${this.baseUrl}/api/shipping/calculate`;

    /** @type {Record<string, any>} Request payload assembled by Given steps. */
    this.payload = {};

    /** @type {import('axios').AxiosResponse | null} Last API response. */
    this.lastResponse = null;

    /** @type {import('selenium-webdriver').WebDriver | null} */
    this.driver = null;

    /**
     * Set to true after submitViaUI() succeeds so Then steps know the
     * browser has a visible result panel.
     */
    this.uiResultVisible = false;
  }

  // ── Browser lifecycle ──────────────────────────────────────────────────────

  async openBrowser() {
    const opts = new chrome.Options();
    if (process.env.HEADLESS !== 'false') {
      opts.addArguments('--headless=new', '--no-sandbox', '--disable-dev-shm-usage');
    }
    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(opts)
      .build();
    await this.driver.manage().window().setRect({ width: 1280, height: 900 });
  }

  async navigateToApp() {
    await this.driver.get(this.baseUrl);
    await this.driver.wait(until.elementLocated(By.id('shipping-form')), 5000);
    this.uiResultVisible = false;
  }

  async closeBrowser() {
    if (this.driver) {
      await this.driver.quit();
      this.driver = null;
    }
  }

  // ── Form interaction ───────────────────────────────────────────────────────

  /**
   * Fill the weight and distance inputs, toggle the fragile switch if needed,
   * submit the form, and wait for the result panel to appear.
   * Only called when isUICompatible() returns true.
   */
  async submitViaUI() {
    const { weight_kg, distance_km, is_fragile } = this.payload;

    // Reset to a clean page state before each UI interaction.
    await this.navigateToApp();

    const weightInput = await this.driver.findElement(By.id('weight'));
    await weightInput.clear();
    await weightInput.sendKeys(String(weight_kg));

    const distInput = await this.driver.findElement(By.id('distance'));
    await distInput.clear();
    await distInput.sendKeys(String(distance_km));

    // The checkbox is visually hidden; click its visible <label> wrapper.
    const checkbox = await this.driver.findElement(By.id('fragile'));
    const isChecked = await checkbox.isSelected();
    if (Boolean(is_fragile) !== isChecked) {
      const label = await this.driver.findElement(By.css('label.toggle-field'));
      await label.click();
    }

    await this.driver.findElement(By.id('submit-btn')).click();

    // Wait for the result panel to become visible (CSS class added by app.js).
    await this.driver.wait(until.elementLocated(By.css('#result.visible')), 5000);
    this.uiResultVisible = true;
  }

  // ── Browser result helpers ─────────────────────────────────────────────────

  /**
   * @param {'base_fee'|'weight_fee'|'distance_fee'|'fragile_surcharge'} field
   * @returns {Promise<string>} Displayed text, e.g. "$5.00"
   */
  async getDisplayedBreakdownValue(field) {
    const idMap = {
      base_fee: 'r-base',
      weight_fee: 'r-weight',
      distance_fee: 'r-distance',
      fragile_surcharge: 'r-fragile',
    };
    const el = await this.driver.findElement(By.id(idMap[field]));
    return (await el.getAttribute('textContent')).trim();
  }

  /** @returns {Promise<string>} Displayed total text, e.g. "$12.00" */
  async getDisplayedTotal() {
    const el = await this.driver.findElement(By.id('r-total'));
    return (await el.getAttribute('textContent')).trim();
  }

  /**
   * @param {'weight-error'|'distance-error'} errorId
   * @returns {Promise<{text: string, visible: boolean}>}
   */
  async getFieldError(errorId) {
    const el = await this.driver.findElement(By.id(errorId));
    const text = (await el.getAttribute('textContent')).trim();
    const display = await el.getCssValue('display');
    return { text, visible: display !== 'none' };
  }

  // ── API helper ─────────────────────────────────────────────────────────────

  /**
   * POST this.payload to the API endpoint.
   * validateStatus: () => true prevents axios from throwing on 4xx/5xx so
   * step definitions can assert on the actual status code.
   */
  async callApi() {
    this.lastResponse = await axios.post(this.apiEndpoint, this.payload, {
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true,
    });
  }

  // ── Utilities ──────────────────────────────────────────────────────────────

  /**
   * Returns true when the payload can be validly entered through the browser
   * form (non-negative finite numbers and a boolean fragile flag).
   */
  isUICompatible() {
    const { weight_kg, distance_km, is_fragile } = this.payload;
    return (
      typeof weight_kg === 'number' &&
      Number.isFinite(weight_kg) &&
      weight_kg >= 0 &&
      typeof distance_km === 'number' &&
      Number.isFinite(distance_km) &&
      distance_km >= 0 &&
      typeof is_fragile === 'boolean'
    );
  }
}

setWorldConstructor(ShippingWorld);
