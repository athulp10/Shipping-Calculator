'use strict';

const { calculateShipping } = require('../src/calculator');

describe('calculateShipping', () => {
  test('AC test case: 2kg, 300km, fragile → $12.00', () => {
    const result = calculateShipping({ weight_kg: 2, distance_km: 300, is_fragile: true });
    expect(result.base_fee).toBe(5.00);
    expect(result.weight_fee).toBe(1.00);
    expect(result.distance_fee).toBe(3.00);
    expect(result.fragile_surcharge).toBe(3.00);
    expect(result.total).toBe(12.00);
  });

  test('non-fragile: 2kg, 300km → $9.00', () => {
    const result = calculateShipping({ weight_kg: 2, distance_km: 300, is_fragile: false });
    expect(result.total).toBe(9.00);
    expect(result.fragile_surcharge).toBe(0);
  });

  test('base only: 0kg, 0km, not fragile → $5.00', () => {
    const result = calculateShipping({ weight_kg: 0, distance_km: 0, is_fragile: false });
    expect(result.total).toBe(5.00);
  });

  test('fractional weight: 1.5kg, 0km → $5.75', () => {
    const result = calculateShipping({ weight_kg: 1.5, distance_km: 0, is_fragile: false });
    expect(result.total).toBe(5.75);
  });

  test('fractional distance: 0kg, 150km → $6.50', () => {
    const result = calculateShipping({ weight_kg: 0, distance_km: 150, is_fragile: false });
    expect(result.total).toBe(6.50);
  });

  test('large values: 100kg, 5000km, not fragile → $105.00', () => {
    const result = calculateShipping({ weight_kg: 100, distance_km: 5000, is_fragile: false });
    expect(result.total).toBe(105.00);
  });
});
