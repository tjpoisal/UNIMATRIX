import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, PRICE_IDS } from "@/lib/stripe";

// POST /api/stripe/checkout — create a Stripe Checkout session
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interval = "monthly" } = await request.json() as { interval?: "monthly" | "yearly" };
  const priceId = interval === "yearly" ? PRICE_IDS.pro_yearly : PRICE_IDS.pro_monthly;

  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe price IDs not configured. Set STRIPE_PRICE_PRO_MONTHLY / STRIPE_PRICE_PRO_YEARLY." },
      { status: 500 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, stripeCustomerId: true, tier: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (user.tier === "pro") {
    return NextResponse.json({ error: "Already on Pro plan" }, { status: 409 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "https://unimatrix-flax.vercel.app";
  const stripe = getStripe();

  // Re-use or create Stripe customer
  let customerId = user.stripeCustomerId ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: user.name ?? undefined,
      metadata: { unimatrixUserId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/settings?upgraded=1`,
    cancel_url:  `${origin}/pricing?cancelled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { unimatrixUserId: user.id },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
