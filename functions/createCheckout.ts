import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const { priceId, goldAmount } = await req.json();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}?payment_success=true&gold=${goldAmount}`,
      cancel_url: `${req.headers.get('origin')}?payment_canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        gold_amount: goldAmount.toString()
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});