import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

// POST /api/stripe/webhook — handle Stripe events
// App Router route handlers receive the raw Request body — no body-parser config needed
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !sig) {
    console.error("Missing STRIPE_WEBHOOK_SECRET or stripe-signature header");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ── Subscription activated / updated ───────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.unimatrixUserId;
        if (!userId) break;

        const isActive = ["active", "trialing"].includes(sub.status);
        await prisma.user.update({
          where: { id: userId },
          data: {
            tier: isActive ? "pro" : "free",
            stripeSubscriptionId: sub.id,
          },
        });
        console.log(`User ${userId} → tier: ${isActive ? "pro" : "free"} (sub: ${sub.id})`);
        break;
      }

      // ── Subscription cancelled / deleted ───────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.unimatrixUserId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: { tier: "free", stripeSubscriptionId: null },
        });
        console.log(`User ${userId} → tier: free (subscription cancelled)`);
        break;
      }

      // ── Customer created / updated — sync customerId ────────────────────────
      case "customer.created":
      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        const userId = customer.metadata?.unimatrixUserId;
        if (!userId) break;

        await prisma.user.update({
          where: { id: userId },
          data: { stripeCustomerId: customer.id },
        });
        break;
      }

      // ── Invoice paid — ensure pro tier is active ────────────────────────────
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: customerId },
          select: { id: true },
        });
        if (!user) break;

        await prisma.user.update({
          where: { id: user.id },
          data: { tier: "pro" },
        });
        break;
      }

      // ── Invoice payment failed — notify but don't immediately downgrade ─────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`Payment failed for customer ${invoice.customer}`);
        break;
      }

      default:
        // Unhandled event type — safe to ignore
        break;
    }
  } catch (err) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
