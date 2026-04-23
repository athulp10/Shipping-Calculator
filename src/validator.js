'use strict';

/**
 * Validate shipping calculation inputs.
 * @param {object} body - Raw request body
 * @returns {string[]} Array of error messages; empty means valid.
 */
function validate(body) {
  const errors = [];
  const { weight_kg, distance_km, is_fragile } = body || {};

  if (weight_kg === undefined || weight_kg === null) {
    errors.push('weight_kg is required');
  } else if (typeof weight_kg !== 'number' || isNaN(weight_kg)) {
    errors.push('weight_kg must be a number');
  } else if (weight_kg < 0) {
    errors.push('weight_kg must be >= 0');
  }

  if (distance_km === undefined || distance_km === null) {
    errors.push('distance_km is required');
  } else if (typeof distance_km !== 'number' || isNaN(distance_km)) {
    errors.push('distance_km must be a number');
  } else if (distance_km < 0) {
    errors.push('distance_km must be >= 0');
  }

  if (is_fragile === undefined || is_fragile === null) {
    errors.push('is_fragile is required');
  } else if (typeof is_fragile !== 'boolean') {
    errors.push('is_fragile must be a boolean');
  }

  return errors;
}

module.exports = { validate };
