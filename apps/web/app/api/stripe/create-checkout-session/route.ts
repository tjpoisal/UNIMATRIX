import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { priceId, successUrl, cancelUrl, customerEmail } = body as { priceId?: string; successUrl?: string; cancelUrl?: string; customerEmail?: string };

    if (!priceId) return NextResponse.json({ error: 'priceId is required' }, { status: 400 });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      billing_address_collection: 'auto',
      customer_email: customerEmail,
      success_url: successUrl ?? `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/billing/cancel`,
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err: unknown) {
    console.error('[stripe] create-checkout-session error', err);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
