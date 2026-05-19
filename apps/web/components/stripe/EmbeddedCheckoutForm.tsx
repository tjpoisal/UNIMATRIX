'use client';

import { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
);

interface Props {
  interval: 'monthly' | 'yearly';
}

export default function EmbeddedCheckoutForm({ interval }: Props) {
  const fetchClientSecret = useCallback(async () => {
    const res = await fetch('/api/stripe/embedded-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interval }),
    });
    const data = await res.json();
    if (!data.clientSecret) throw new Error(data.error ?? 'Failed to start checkout');
    return data.clientSecret as string;
  }, [interval]);

  return (
    <EmbeddedCheckoutProvider
      stripe={stripePromise}
      options={{ fetchClientSecret }}
    >
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
  );
}
