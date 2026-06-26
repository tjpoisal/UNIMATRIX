"use client";

import React from 'react';
import Link from 'next/link';

export default function OnboardingFlow(): React.ReactElement {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-bold mb-6">Onboarding (placeholder)</h1>
        <p className="text-sm text-text-secondary">This onboarding component was restored to a clean state. It will be filled with full content in a follow-up where we can do smaller, safer edits.</p>
        <div className="mt-6">
          <Link href="/dashboard" className="inline-block px-4 py-2 bg-accent text-bg rounded">Go to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
