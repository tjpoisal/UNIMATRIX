import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, PRICE_IDS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { interval = "monthly", plan = "pro" } = (await request.json()) as {
    interval?: "monthly" | "yearly";
    plan?: "pro" | "enterprise";
  };

  const priceId =
    plan === "enterprise"
      ? interval === "yearly" ? PRICE_IDS.enterprise_yearly : PRICE_IDS.enterprise_monthly
      : interval === "yearly" ? PRICE_IDS.pro_yearly        : PRICE_IDS.pro_monthly;

  if (!priceId) {
    return NextResponse.json(
      { error: `Stripe price not configured. Set STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}.` },
      { status: 500 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true, stripeCustomerId: true, tier: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.tier === plan) return NextResponse.json({ error: `Already on ${plan} plan` }, { status: 409 });

  const origin =
    request.headers.get("origin") ??
    process.env.NEXTAUTH_URL ??
    "https://deployunimatrix.com";

  const stripe = getStripe();

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
    // @ts-expect-error stripe-node v22 UiMode type excludes 'embedded'; valid at runtime
    ui_mode: "embedded",
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    return_url: `${origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { unimatrixUserId: user.id, plan },
    },
  });

  return NextResponse.json({ clientSecret: checkoutSession.client_secret });
}
