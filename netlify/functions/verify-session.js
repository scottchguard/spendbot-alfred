const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase with service role key for admin access
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { sessionId } = JSON.parse(event.body);

    if (!sessionId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing sessionId' }),
      };
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Session not found' }),
      };
    }

    const paid = session.payment_status === 'paid';
    const userId = session.metadata?.user_id;
    const email = session.metadata?.email || session.customer_email;

    // If paid, update Supabase as a backup (webhook should also do this)
    // Security: Only update if we have a valid user_id from the session metadata
    if (paid && userId) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_premium: true })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update premium in verify-session:', updateError);
        // Don't fail the response - just log it
      }
    }

    // Note: We intentionally do NOT fall back to email-only updates
    // as this could allow unauthorized premium upgrades if someone
    // knows another user's email address

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paid,
        userId,
        email,
      }),
    };
  } catch (error) {
    console.error('Verify session error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
