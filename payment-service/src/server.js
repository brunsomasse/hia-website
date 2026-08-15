/**
 * HIA Payment Service — Express/Stripe API
 * ==========================================
 * Container 2: handles all Stripe payment processing
 * Runs on port 3001, proxied via Nginx at /api/payment/
 */

const express = require('express');
const cors    = require('cors');
const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app  = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'https://hope-international-association.com',
  methods: ['POST', 'GET'],
  allowedHeaders: ['Content-Type']
}));

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'hia-payment',
    timestamp: new Date().toISOString()
  });
});

// ── Create Payment Intent ───────────────────────────────────────────────────
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency = 'chf' } = req.body;
  const amountInCents = Math.round(parseFloat(amount) * 100);

  if (!amountInCents || amountInCents < 100) {
    return res.status(400).json({ error: 'Invalid amount. Minimum is CHF 1.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      payment_method_types: ['card'],
      metadata: {
        organization: 'Hope International Association',
        registration:  '482.5.021.9302',
        source:        'hia-website'
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (err) {
    console.error('[Stripe Error]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Donation amounts (for dynamic front-end config) ─────────────────────────
app.get('/config', (req, res) => {
  res.json({
    currency: 'CHF',
    amounts: [20, 50, 100, 250],
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || ''
  });
});

// ── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[HIA Payment Service] Running on port ${PORT}`);
  console.log(`[HIA Payment Service] Allowed origin: ${process.env.ALLOWED_ORIGIN}`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('[HIA Payment Service] ⚠️  STRIPE_SECRET_KEY not set!');
  }
});
