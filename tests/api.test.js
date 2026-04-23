'use strict';

const request = require('supertest');
const app = require('../src/server');

describe('POST /api/shipping/calculate', () => {
  test('AC test case: 2kg, 300km, fragile → 200 + $12.00', async () => {
    const res = await request(app)
      .post('/api/shipping/calculate')
      .send({ weight_kg: 2, distance_km: 300, is_fragile: true });

    expect(res.status).toBe(200);
    expect(res.body.breakdown.base_fee).toBe(5.00);
    expect(res.body.breakdown.weight_fee).toBe(1.00);
    expect(res.body.breakdown.distance_fee).toBe(3.00);
    expect(res.body.breakdown.fragile_surcharge).toBe(3.00);
    expect(res.body.total).toBe(12.00);
    expect(res.body.currency).toBe('USD');
  });

  test('non-fragile order → total $9.00', async () => {
    const res = await request(app)
      .post('/api/shipping/calculate')
      .send({ weight_kg: 2, distance_km: 300, is_fragile: false });

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(9.00);
    expect(res.body.breakdown.fragile_surcharge).toBe(0);
  });

  test('missing is_fragile → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/shipping/calculate')
      .send({ weight_kg: 2, distance_km: 300 });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.details).toContain('is_fragile is required');
  });

  test('negative weight → 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/shipping/calculate')
      .send({ weight_kg: -5, distance_km: 300, is_fragile: false });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
    expect(res.body.details).toContain('weight_kg must be >= 0');
  });

  test('empty body → 400 with three errors', async () => {
    const res = await request(app)
      .post('/api/shipping/calculate')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.details).toHaveLength(3);
  });
});
