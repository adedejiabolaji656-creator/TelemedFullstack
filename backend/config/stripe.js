const Stripe = require('stripe');

// Use a placeholder so the server can boot without a configured key.
// Real API calls will fail with an auth error until a valid key is set.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_missing_key', {
  apiVersion: '2024-04-10',
});

module.exports = stripe;
