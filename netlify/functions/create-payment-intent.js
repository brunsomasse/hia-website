// HIA Website — Stripe Payment Intent Function
// Uses native https module — no npm install required

const https = require('https');

function stripeRequest(path, data, secretKey) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(data).toString();
    const options = {
      hostname: 'api.stripe.com',
      path,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body)
      }
    };
    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => resolve(JSON.parse(raw)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe not configured' }) };
  }

  try {
    const { amount, currency } = JSON.parse(event.body);
    const amountInCents = Math.round(parseFloat(amount) * 100);

    if (!amountInCents || amountInCents < 100) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
    }

    const paymentIntent = await stripeRequest(
      '/v1/payment_intents',
      {
        amount: amountInCents,
        currency: currency || 'chf',
        'automatic_payment_methods[enabled]': 'true',
        'metadata[organization]': 'Hope International Association',
        'metadata[registration]': '482.5.021.9302'
      },
      secretKey
    );

    if (paymentIntent.error) {
      return { statusCode: 400, body: JSON.stringify({ error: paymentIntent.error.message }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };

  } catch (error) {
    console.error('Payment error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
