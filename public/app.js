'use strict';

const form        = document.getElementById('shipping-form');
const resultDiv   = document.getElementById('result');
const submitBtn   = document.getElementById('submit-btn');
const btnText     = submitBtn.querySelector('.btn-text');
const weightInput = document.getElementById('weight');
const distInput   = document.getElementById('distance');

// ── Helpers ──────────────────────────────────────────────

function fmt(value) {
  return '$' + Number(value).toFixed(2);
}

function setFieldError(inputId, errorId, message) {
  document.getElementById(inputId).classList.add('invalid');
  const el = document.getElementById(errorId);
  el.textContent = message;
  el.classList.add('visible');
}

function clearFieldError(inputId, errorId) {
  document.getElementById(inputId).classList.remove('invalid');
  const el = document.getElementById(errorId);
  el.textContent = '';
  el.classList.remove('visible');
}

// ── Per-field validators (return true = valid) ────────────

function validateWeight(raw) {
  const num = Number(raw);
  if (raw === '' || isNaN(num)) {
    setFieldError('weight', 'weight-error', 'Weight is required and must be a number.');
    return false;
  }
  if (num < 0) {
    setFieldError('weight', 'weight-error', 'Weight must be 0 or greater.');
    return false;
  }
  clearFieldError('weight', 'weight-error');
  return true;
}

function validateDistance(raw) {
  const num = Number(raw);
  if (raw === '' || isNaN(num)) {
    setFieldError('distance', 'distance-error', 'Distance is required and must be a number.');
    return false;
  }
  if (num < 0) {
    setFieldError('distance', 'distance-error', 'Distance must be 0 or greater.');
    return false;
  }
  clearFieldError('distance', 'distance-error');
  return true;
}

// ── Real-time validation ─────────────────────────────────
// Validate on blur (first touch); on input only when already invalid (clear-as-you-fix).

weightInput.addEventListener('blur',  () => validateWeight(weightInput.value.trim()));
weightInput.addEventListener('input', () => {
  if (weightInput.classList.contains('invalid')) validateWeight(weightInput.value.trim());
});

distInput.addEventListener('blur',  () => validateDistance(distInput.value.trim()));
distInput.addEventListener('input', () => {
  if (distInput.classList.contains('invalid')) validateDistance(distInput.value.trim());
});

// ── Loading state ────────────────────────────────────────

function setLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitBtn.classList.toggle('loading', isLoading);
  btnText.textContent = isLoading ? 'Calculating…' : 'Calculate Shipping';
}

// ── Form submit ──────────────────────────────────────────

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  resultDiv.classList.remove('visible');

  const weightVal = weightInput.value.trim();
  const distVal   = distInput.value.trim();
  const isFragile = document.getElementById('fragile').checked;

  // Run both so all errors surface at once
  const weightOk   = validateWeight(weightVal);
  const distanceOk = validateDistance(distVal);
  if (!weightOk || !distanceOk) return;

  setLoading(true);

  const payload = {
    weight_kg:   Number(weightVal),
    distance_km: Number(distVal),
    is_fragile:  isFragile,
  };

  try {
    const response = await fetch('/api/shipping/calculate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.details) {
        data.details.forEach((msg) => {
          if (msg.includes('weight_kg'))   setFieldError('weight',   'weight-error',   msg);
          else if (msg.includes('distance_km')) setFieldError('distance', 'distance-error', msg);
        });
      }
      return;
    }

    document.getElementById('r-base').textContent     = fmt(data.breakdown.base_fee);
    document.getElementById('r-weight').textContent   = fmt(data.breakdown.weight_fee);
    document.getElementById('r-distance').textContent = fmt(data.breakdown.distance_fee);
    document.getElementById('r-fragile').textContent  = fmt(data.breakdown.fragile_surcharge);
    document.getElementById('r-total').textContent    = fmt(data.total);

    resultDiv.classList.add('visible');
  } catch {
    alert('Could not reach the server. Please ensure it is running.');
  } finally {
    setLoading(false);
  }
});
