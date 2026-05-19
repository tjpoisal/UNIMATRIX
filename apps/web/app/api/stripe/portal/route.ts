import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

// POST /api/stripe/portal — redirect to Stripe customer portal (manage/cancel subscription)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No billing account found" }, { status: 404 });
  }

  const origin = request.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "https://unimatrix-flax.vercel.app";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${origin}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
