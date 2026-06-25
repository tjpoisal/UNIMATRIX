import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    // Accept either STRIPE_SECRET_KEY (explicit) or STRIPE_SECRET (legacy/name used in .env)
    const key = process.env.STRIPE_SECRET_KEY ?? process.env.STRIPE_SECRET;
    if (!key) throw new Error("STRIPE secret is not set (STRIPE_SECRET_KEY or STRIPE_SECRET)");
    _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  }
  return _stripe;
}

// Price IDs — set in Stripe dashboard and add to Vercel env vars
export const PRICE_IDS = {
  pro_monthly:          process.env.STRIPE_PRICE_PRO_MONTHLY          ?? "",
  pro_yearly:           process.env.STRIPE_PRICE_PRO_YEARLY           ?? "",
  enterprise_monthly:   process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY   ?? "",
  enterprise_yearly:    process.env.STRIPE_PRICE_ENTERPRISE_YEARLY    ?? "",
};

export const TIER_LIMITS = {
  free: {
    palaces:  3,
    memories: 200,
    apiKeys:  1,
    sharing:  false,
    agents:   false,
    selfHost: false,
  },
  pro: {
    palaces:  Infinity,
    memories: Infinity,
    apiKeys:  20,
    sharing:  true,
    agents:   false,
    selfHost: false,
  },
  enterprise: {
    palaces:  Infinity,
    memories: Infinity,
    apiKeys:  100,
    sharing:  true,
    agents:   true,
    selfHost: true,
  },
} as const;

export type Tier = keyof typeof TIER_LIMITS;
