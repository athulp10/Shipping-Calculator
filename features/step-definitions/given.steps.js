'use strict';

const { Given } = require('@cucumber/cucumber');

// ── Background steps ───────────────────────────────────────────────────────

/**
 * Verifies that the browser successfully loaded the shipping calculator UI,
 * which was already opened in the Before hook.
 */
Given('the shipping calculator service is running', async function () {
  const title = await this.driver.getTitle();
  if (!title) {
    throw new Error('Browser page did not load — shipping calculator service may not be running');
  }
});

/**
 * Overrides the default API endpoint derived from BASE_URL.
 * Accepts both "POST /api/..." and bare path formats.
 *
 * Example: the API endpoint is "POST /api/shipping/calculate"
 */
Given('the API endpoint is {string}', function (endpoint) {
  // Strip HTTP method prefix if present, e.g. "POST /api/..."
  const path = endpoint.replace(/^(GET|POST|PUT|PATCH|DELETE)\s+/i, '');
  this.apiEndpoint = `${this.baseUrl}${path}`;
});

/**
 * Informational Background step that documents the server-side pricing rules.
 * No runtime action is required.
 */
Given('the pricing rules are:', function (_dataTable) {
  // Intentionally empty — pricing constants are defined server-side.
});

// ── Package weight ─────────────────────────────────────────────────────────

/**
 * Sets a numeric weight (supports positive, zero, and negative float values).
 *
 * Examples:
 *   Given a package weighing 2 kg
 *   Given a package weighing 1.5 kg
 *   Given a package weighing -1 kg
 */
Given('a package weighing {float} kg', function (weight) {
  this.payload.weight_kg = weight;
});

/**
 * Sets weight_kg to a non-numeric string value to trigger type validation.
 *
 * Example: Given a weight_kg of "heavy"
 */
Given('a weight_kg of {string}', function (value) {
  this.payload.weight_kg = value;
});

/**
 * Sets weight_kg to the string "NaN".
 *
 * Note: JSON.stringify(NaN) produces "null", which would trigger the
 * "required" error rather than the "must be a number" error. Sending the
 * string "NaN" correctly exercises the type-check branch of the validator.
 */
Given('a weight_kg of NaN', function () {
  this.payload.weight_kg = 'NaN';
});

/**
 * Sets weight_kg to null to exercise the "required" validation branch.
 */
Given('a weight_kg of null', function () {
  this.payload.weight_kg = null;
});

/**
 * Removes weight_kg entirely from the payload so it is absent from the request.
 */
Given('no weight_kg is provided', function () {
  delete this.payload.weight_kg;
});

// ── Delivery distance ──────────────────────────────────────────────────────

/**
 * Sets a numeric delivery distance (supports positive, zero, and negative floats).
 *
 * Examples:
 *   Given a delivery distance of 300 km
 *   Given a delivery distance of 150 km
 *   Given a delivery distance of -10 km
 */
Given('a delivery distance of {float} km', function (distance) {
  this.payload.distance_km = distance;
});

/**
 * Sets distance_km to a non-numeric string value to trigger type validation.
 *
 * Example: Given a distance_km of "far"
 */
Given('a distance_km of {string}', function (value) {
  this.payload.distance_km = value;
});

/**
 * Removes distance_km entirely from the payload so it is absent from the request.
 */
Given('no distance_km is provided', function () {
  delete this.payload.distance_km;
});

// ── Fragile flag ───────────────────────────────────────────────────────────

/**
 * Sets is_fragile to boolean true.
 */
Given('the package is fragile', function () {
  this.payload.is_fragile = true;
});

/**
 * Sets is_fragile to boolean false.
 */
Given('the package is not fragile', function () {
  this.payload.is_fragile = false;
});

/**
 * Sets is_fragile from a Scenario Outline placeholder word ("true" or "false").
 *
 * Example column value: true  →  this.payload.is_fragile = true
 */
Given('the package fragile status is {word}', function (status) {
  this.payload.is_fragile = status === 'true';
});

/**
 * Sets is_fragile to a non-boolean string to trigger type validation.
 *
 * Example: Given an is_fragile value of "yes"
 */
Given('an is_fragile value of {string}', function (value) {
  this.payload.is_fragile = value;
});

/**
 * Sets is_fragile to a numeric integer (0 or 1) to trigger type validation.
 *
 * Examples:
 *   Given an is_fragile value of 1
 *   Given an is_fragile value of 0
 */
Given('an is_fragile value of {int}', function (value) {
  this.payload.is_fragile = value;
});

/**
 * Removes is_fragile entirely from the payload so it is absent from the request.
 */
Given('no is_fragile is provided', function () {
  delete this.payload.is_fragile;
});

// ── Whole-body helpers ─────────────────────────────────────────────────────

/**
 * Resets the payload to an empty object, sending {} in the request body.
 */
Given('an empty request body', function () {
  this.payload = {};
});
