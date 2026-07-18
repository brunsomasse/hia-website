const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { amount, currency } = JSON.parse(event.body);
    const amountInCents = Math.round(parseFloat(amount) * 100);
    if (!amountInCents || amountInCents < 100) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
    }
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency || 'chf',
      automatic_payment_methods: { enabled: true },
      metadata: {
        organization: 'Hope International Association',
        registration: '482.5.021.9302'
      }
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
