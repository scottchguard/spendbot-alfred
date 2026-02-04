import { loadStripe } from '@stripe/stripe-js';

// Validate Stripe publishable key exists
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  console.error(
    '[Stripe] Missing VITE_STRIPE_PUBLISHABLE_KEY environment variable. ' +
    'Stripe checkout will not work. Please add it to your .env file or Netlify environment variables.'
  );
}

// Initialize Stripe with publishable key
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : Promise.resolve(null);

/**
 * Create a Stripe Checkout session and redirect to payment
 * @param {string} userId - Supabase user ID
 * @param {string} email - User email (fallback identifier)
 * @returns {Promise<void>}
 */
export async function redirectToCheckout(userId, email) {
  const stripe = await stripePromise;
  
  if (!stripe) {
    throw new Error('Stripe failed to load');
  }

  // Create checkout session via our Netlify function
  const response = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      email,
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/?canceled=true`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create checkout session');
  }

  const { sessionId } = await response.json();

  // Redirect to Stripe Checkout
  const { error } = await stripe.redirectToCheckout({ sessionId });
  
  if (error) {
    throw error;
  }
}

/**
 * Verify a checkout session and return its status
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<{paid: boolean, userId: string, email: string}>}
 */
export async function verifyCheckoutSession(sessionId) {
  const response = await fetch('/.netlify/functions/verify-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify session');
  }

  return response.json();
}

export { stripePromise };
