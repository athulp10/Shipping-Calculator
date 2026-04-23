'use strict';

const express = require('express');
const path = require('path');
const { calculateShipping } = require('./calculator');
const { validate } = require('./validator');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.post('/api/shipping/calculate', (req, res) => {
  const errors = validate(req.body);

  if (errors.length > 0) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', details: errors });
  }

  const { base_fee, weight_fee, distance_fee, fragile_surcharge, total } =
    calculateShipping(req.body);

  return res.status(200).json({
    breakdown: { base_fee, weight_fee, distance_fee, fragile_surcharge },
    total,
    currency: 'USD',
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () =>
    console.log(`Shipping calculator running on http://localhost:${PORT}`)
  );
}

module.exports = app;
