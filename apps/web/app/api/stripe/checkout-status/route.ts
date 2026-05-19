import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

// GET /api/stripe/checkout-status?session_id=... — retrieve session status for return page
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "session_id required" }, { status: 400 });
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  return NextResponse.json({
    status: session.status,
    customer_email: session.customer_details?.email ?? null,
  });
}
