import Stripe from "stripe";

// Lazy singleton — Next.js evaluates modules at build time; calling new Stripe()
// with an empty key throws immediately. Defer until the first real request.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
  }
  return _stripe;
}

// Price IDs — set these in your Stripe dashboard and add to env
export const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
  pro_yearly:  process.env.STRIPE_PRICE_PRO_YEARLY  ?? "",
};

// Tier limits
export const TIER_LIMITS = {
  free: {
    palaces:   3,
    memories:  200,
    apiKeys:   1,
    sharing:   false,
  },
  pro: {
    palaces:   Infinity,
    memories:  Infinity,
    apiKeys:   20,
    sharing:   true,
  },
} as const;

export type Tier = keyof typeof TIER_LIMITS;
