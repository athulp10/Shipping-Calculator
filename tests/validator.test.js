'use strict';

const { validate } = require('../src/validator');

describe('validate', () => {
  test('valid input → no errors', () => {
    expect(validate({ weight_kg: 2, distance_km: 300, is_fragile: true })).toEqual([]);
  });

  test('missing weight_kg → error', () => {
    const errors = validate({ distance_km: 300, is_fragile: false });
    expect(errors).toContain('weight_kg is required');
  });

  test('missing distance_km → error', () => {
    const errors = validate({ weight_kg: 2, is_fragile: false });
    expect(errors).toContain('distance_km is required');
  });

  test('missing is_fragile → error', () => {
    const errors = validate({ weight_kg: 2, distance_km: 300 });
    expect(errors).toContain('is_fragile is required');
  });

  test('negative weight_kg → error', () => {
    const errors = validate({ weight_kg: -1, distance_km: 300, is_fragile: false });
    expect(errors).toContain('weight_kg must be >= 0');
  });

  test('negative distance_km → error', () => {
    const errors = validate({ weight_kg: 2, distance_km: -10, is_fragile: false });
    expect(errors).toContain('distance_km must be >= 0');
  });

  test('non-numeric weight_kg → error', () => {
    const errors = validate({ weight_kg: 'heavy', distance_km: 300, is_fragile: false });
    expect(errors).toContain('weight_kg must be a number');
  });

  test('non-boolean is_fragile → error', () => {
    const errors = validate({ weight_kg: 2, distance_km: 300, is_fragile: 'yes' });
    expect(errors).toContain('is_fragile must be a boolean');
  });

  test('all fields missing → three errors', () => {
    const errors = validate({});
    expect(errors).toHaveLength(3);
  });
});
