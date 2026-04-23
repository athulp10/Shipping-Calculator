'use strict';

const BASE_FEE = 5.00;
const RATE_PER_KG = 0.50;
const RATE_PER_100KM = 1.00;
const FRAGILE_SURCHARGE = 3.00;

/**
 * Calculate shipping cost breakdown.
 * @param {number} weight_kg   - Package weight in kilograms (>= 0)
 * @param {number} distance_km - Delivery distance in kilometres (>= 0)
 * @param {boolean} is_fragile - Whether the item requires fragile handling
 * @returns {{ base_fee, weight_fee, distance_fee, fragile_surcharge, total }}
 */
function calculateShipping({ weight_kg, distance_km, is_fragile }) {
  const baseFee = BASE_FEE;
  const weightFee = weight_kg * RATE_PER_KG;
  const distanceFee = (distance_km / 100) * RATE_PER_100KM;
  const fragileSurcharge = is_fragile ? FRAGILE_SURCHARGE : 0;

  const total = parseFloat(
    (baseFee + weightFee + distanceFee + fragileSurcharge).toFixed(2)
  );

  return {
    base_fee: baseFee,
    weight_fee: weightFee,
    distance_fee: distanceFee,
    fragile_surcharge: fragileSurcharge,
    total,
  };
}

module.exports = { calculateShipping };
