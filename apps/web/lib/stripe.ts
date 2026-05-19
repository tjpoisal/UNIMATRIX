import Stripe from "stripe";

// Use empty string as fallback so Next.js can analyse the module at build time
// without throwing. Runtime calls will fail with an auth error if the key is
// not set, which is the correct behaviour.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-04-22.dahlia",
});

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
