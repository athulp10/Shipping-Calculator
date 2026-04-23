'use strict';

const { Then } = require('@cucumber/cucumber');
const assert = require('assert');

// ── HTTP Status ────────────────────────────────────────────────────────────

/**
 * Asserts the HTTP response status code.
 *
 * Examples:
 *   Then the response status should be 200
 *   Then the response status should be 400
 */
Then('the response status should be {int}', function (expectedStatus) {
  assert.strictEqual(
    this.lastResponse.status,
    expectedStatus,
    `Expected HTTP ${expectedStatus} but received ${this.lastResponse.status}. ` +
      `Body: ${JSON.stringify(this.lastResponse.data)}`
  );
});

// ── Currency ───────────────────────────────────────────────────────────────

/**
 * Asserts the currency field in the success response.
 *
 * Example: Then the response currency should be "USD"
 */
Then('the response currency should be {string}', function (currency) {
  assert.strictEqual(
    this.lastResponse.data.currency,
    currency,
    `Expected currency "${currency}" but got "${this.lastResponse.data.currency}"`
  );
});

// ── Fee Breakdown — full data table ───────────────────────────────────────

/**
 * Asserts all fee fields in the breakdown object against a two-column table.
 *
 * Example table:
 *   | Fee               | Amount |
 *   | base_fee          | 5.00   |
 *   | weight_fee        | 1.00   |
 *   | distance_fee      | 3.00   |
 *   | fragile_surcharge | 3.00   |
 */
Then('the fee breakdown should be:', async function (dataTable) {
  const breakdown = this.lastResponse.data.breakdown;
  assert.ok(breakdown, 'Expected response.breakdown to exist');

  for (const row of dataTable.hashes()) {
    const field = row['Fee'];
    const expected = parseFloat(row['Amount']);
    assert.strictEqual(
      breakdown[field],
      expected,
      `breakdown.${field}: expected ${expected}, got ${breakdown[field]}`
    );
  }

  // Also verify the rendered UI values when a result panel is visible.
  if (this.uiResultVisible) {
    for (const row of dataTable.hashes()) {
      const field = row['Fee'];
      const expected = parseFloat(row['Amount']);
      const displayed = await this.getDisplayedBreakdownValue(field);
      const expectedFormatted = `$${expected.toFixed(2)}`;
      assert.strictEqual(
        displayed,
        expectedFormatted,
        `UI breakdown.${field}: expected "${expectedFormatted}", got "${displayed}"`
      );
    }
  }
});

// ── Fee Breakdown — individual field assertions ────────────────────────────

/**
 * Example: And the fee breakdown should include a fragile_surcharge of $0.00
 */
Then(
  /^the fee breakdown should include a fragile_surcharge of \$(\d+\.?\d*)$/,
  async function (amount) {
    const expected = parseFloat(amount);
    assert.strictEqual(
      this.lastResponse.data.breakdown.fragile_surcharge,
      expected,
      `Expected fragile_surcharge ${expected}, got ${this.lastResponse.data.breakdown.fragile_surcharge}`
    );
    if (this.uiResultVisible) {
      const displayed = await this.getDisplayedBreakdownValue('fragile_surcharge');
      assert.strictEqual(displayed, `$${expected.toFixed(2)}`);
    }
  }
);

/**
 * Example: And the fee breakdown should include a weight_fee of $0.00
 */
Then(
  /^the fee breakdown should include a weight_fee of \$(\d+\.?\d*)$/,
  async function (amount) {
    const expected = parseFloat(amount);
    assert.strictEqual(
      this.lastResponse.data.breakdown.weight_fee,
      expected,
      `Expected weight_fee ${expected}, got ${this.lastResponse.data.breakdown.weight_fee}`
    );
    if (this.uiResultVisible) {
      const displayed = await this.getDisplayedBreakdownValue('weight_fee');
      assert.strictEqual(displayed, `$${expected.toFixed(2)}`);
    }
  }
);

/**
 * Example: And the fee breakdown should include a distance_fee of $1.50
 */
Then(
  /^the fee breakdown should include a distance_fee of \$(\d+\.?\d*)$/,
  async function (amount) {
    const expected = parseFloat(amount);
    assert.strictEqual(
      this.lastResponse.data.breakdown.distance_fee,
      expected,
      `Expected distance_fee ${expected}, got ${this.lastResponse.data.breakdown.distance_fee}`
    );
    if (this.uiResultVisible) {
      const displayed = await this.getDisplayedBreakdownValue('distance_fee');
      assert.strictEqual(displayed, `$${expected.toFixed(2)}`);
    }
  }
);

// ── Total ──────────────────────────────────────────────────────────────────

/**
 * Asserts the numeric total from the API response and, for UI-compatible
 * scenarios, also verifies the value rendered in the #r-total element.
 *
 * Example: Then the total shipping cost should be $12.00
 */
Then(
  /^the total shipping cost should be \$(\d+\.?\d*)$/,
  async function (amount) {
    const expected = parseFloat(amount);

    // API assertion
    assert.strictEqual(
      this.lastResponse.data.total,
      expected,
      `API total: expected ${expected}, got ${this.lastResponse.data.total}`
    );

    // Browser / UI assertion
    if (this.uiResultVisible) {
      const displayed = await this.getDisplayedTotal();
      const expectedFormatted = `$${expected.toFixed(2)}`;
      assert.strictEqual(
        displayed,
        expectedFormatted,
        `UI total: expected "${expectedFormatted}", got "${displayed}"`
      );
    }
  }
);

/**
 * Asserts that the total in the API response has at most 2 decimal places.
 */
Then('the total shipping cost should have at most 2 decimal places', function () {
  const total = this.lastResponse.data.total;
  const str = String(total);
  const dotIndex = str.indexOf('.');
  const decimalPlaces = dotIndex === -1 ? 0 : str.length - dotIndex - 1;
  assert.ok(
    decimalPlaces <= 2,
    `Expected total "${total}" to have at most 2 decimal places but found ${decimalPlaces}`
  );
});

// ── Error code ─────────────────────────────────────────────────────────────

/**
 * Asserts the error code in a 4xx response body.
 *
 * Example: Then the error code should be "VALIDATION_ERROR"
 */
Then('the error code should be {string}', function (code) {
  assert.strictEqual(
    this.lastResponse.data.error,
    code,
    `Expected error code "${code}" but got "${this.lastResponse.data.error}"`
  );
});

// ── Error details ──────────────────────────────────────────────────────────

/**
 * Asserts that the details array contains a specific error message string.
 *
 * Example: And the error details should contain "weight_kg is required"
 */
Then('the error details should contain {string}', function (message) {
  const details = this.lastResponse.data.details;
  assert.ok(
    Array.isArray(details),
    `Expected response.details to be an array but got: ${JSON.stringify(details)}`
  );
  assert.ok(
    details.includes(message),
    `Expected details to contain "${message}" but got: ${JSON.stringify(details)}`
  );
});

/**
 * Asserts the exact number of error messages in the details array.
 *
 * Example: And the error details should contain exactly 3 errors
 */
Then('the error details should contain exactly {int} errors', function (count) {
  const details = this.lastResponse.data.details;
  assert.ok(
    Array.isArray(details),
    `Expected response.details to be an array but got: ${JSON.stringify(details)}`
  );
  assert.strictEqual(
    details.length,
    count,
    `Expected exactly ${count} error(s) but got ${details.length}: ${JSON.stringify(details)}`
  );
});

// ── Response body structure ────────────────────────────────────────────────

/**
 * Asserts that a key exists in the response body and its value is a plain object.
 *
 * Example: And the response body should contain a "breakdown" object
 */
Then('the response body should contain a {string} object', function (key) {
  const data = this.lastResponse.data;
  assert.ok(key in data, `Expected response to contain key "${key}"`);
  assert.strictEqual(
    typeof data[key],
    'object',
    `Expected "${key}" to be an object but got ${typeof data[key]}`
  );
  assert.ok(!Array.isArray(data[key]), `Expected "${key}" to be a plain object, not an array`);
});

/**
 * Asserts that a nested key exists inside a parent object in the response body.
 *
 * Example: And the "breakdown" object should contain "base_fee"
 */
Then('the {string} object should contain {string}', function (parent, key) {
  const parentObj = this.lastResponse.data[parent];
  assert.ok(
    parentObj,
    `Expected response to contain a "${parent}" object but it is missing`
  );
  assert.ok(
    key in parentObj,
    `Expected "${parent}" to contain key "${key}" but it is missing`
  );
});

/**
 * Asserts that a key exists in the response body (any value type).
 * Handles both "a" and "an" articles.
 *
 * Examples:
 *   And the response body should contain a "total" field
 *   And the response body should contain an "error" field
 */
Then(
  /^the response body should contain (?:a|an) "([^"]+)" field$/,
  function (key) {
    const data = this.lastResponse.data;
    assert.ok(key in data, `Expected response to contain field "${key}"`);
  }
);

/**
 * Asserts that a key exists in the response body and its value is an array.
 *
 * Example: And the response body should contain a "details" array
 */
Then('the response body should contain a {string} array', function (key) {
  const data = this.lastResponse.data;
  assert.ok(key in data, `Expected response to contain key "${key}"`);
  assert.ok(Array.isArray(data[key]), `Expected "${key}" to be an array`);
});
