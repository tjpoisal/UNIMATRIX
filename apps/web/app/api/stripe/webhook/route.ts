import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? '';

export const runtime = 'nodejs';

function epochToDate(value: unknown): Date | null {
  return typeof value === 'number' ? new Date(value * 1000) : null;
}

function subFieldDate(sub: Stripe.Subscription, key: string) {
  const rec = sub as unknown as Record<string, unknown>;
  return epochToDate(rec[key]);
}

export async function POST(req: NextRequest) {
  const buf = await req.arrayBuffer();
  const raw = Buffer.from(buf);
  const sig = req.headers.get('stripe-signature') ?? req.headers.get('Stripe-Signature') ?? '';

  if (!webhookSecret) {
    console.error('[stripe:webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, webhookSecret) as Stripe.Event;
  } catch (err: unknown) {
    console.error('[stripe:webhook] signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    // Handle subscription and checkout events
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.customer) {
        const subscriptionId = String(session.subscription);
        const customerId = String(session.customer);
        // Retrieve the subscription to get details
        const sub = (await stripe.subscriptions.retrieve(subscriptionId as string)) as Stripe.Subscription;

        await prisma.stripeSubscription.upsert({
          where: { stripeSubscriptionId: subscriptionId },
          update: {
            stripeCustomerId: customerId,
            status: sub.status,
            priceId: sub.items.data[0]?.price?.id ?? null,
            currentPeriodStart: subFieldDate(sub, 'current_period_start'),
            currentPeriodEnd: subFieldDate(sub, 'current_period_end'),
            trialStart: subFieldDate(sub, 'trial_start'),
            trialEnd: subFieldDate(sub, 'trial_end'),
            cancelledAt: subFieldDate(sub, 'canceled_at'),
            metadata: sub.metadata ?? {},
          },
          create: {
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: customerId,
            status: sub.status,
            priceId: sub.items.data[0]?.price?.id ?? null,
            currentPeriodStart: subFieldDate(sub, 'current_period_start'),
            currentPeriodEnd: subFieldDate(sub, 'current_period_end'),
            trialStart: subFieldDate(sub, 'trial_start'),
            trialEnd: subFieldDate(sub, 'trial_end'),
            cancelledAt: subFieldDate(sub, 'canceled_at'),
            metadata: sub.metadata ?? {},
          },
        });
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
      const sub = event.data.object as Stripe.Subscription;
      const subscriptionId = sub.id;
      const customerId = String(sub.customer);

      await prisma.stripeSubscription.upsert({
        where: { stripeSubscriptionId: subscriptionId },
        update: {
          stripeCustomerId: customerId,
          status: sub.status,
          priceId: sub.items.data[0]?.price?.id ?? null,
          currentPeriodStart: subFieldDate(sub, 'current_period_start'),
          currentPeriodEnd: subFieldDate(sub, 'current_period_end'),
          trialStart: subFieldDate(sub, 'trial_start'),
          trialEnd: subFieldDate(sub, 'trial_end'),
          cancelledAt: subFieldDate(sub, 'canceled_at'),
          metadata: sub.metadata ?? {},
        },
        create: {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          status: sub.status,
          priceId: sub.items.data[0]?.price?.id ?? null,
          currentPeriodStart: subFieldDate(sub, 'current_period_start'),
          currentPeriodEnd: subFieldDate(sub, 'current_period_end'),
          trialStart: subFieldDate(sub, 'trial_start'),
          trialEnd: subFieldDate(sub, 'trial_end'),
          cancelledAt: subFieldDate(sub, 'canceled_at'),
          metadata: sub.metadata ?? {},
        },
      });
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      const subscriptionId = sub.id;
      // Soft-delete or mark cancelled
      await prisma.stripeSubscription.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: { status: 'deleted', cancelledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : new Date() },
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe:webhook] processing error', err);
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}
