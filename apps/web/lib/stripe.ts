import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-04-30.basil",
  typescript: true,
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
