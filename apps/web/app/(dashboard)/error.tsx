'use client';

/**
 * Error Boundary for Dashboard
 * 
 * Catches errors in the dashboard and displays a fallback UI.
 */

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0F1C]">
      <Card className="max-w-md w-full bg-[#111827] border-[#334155/30]">
        <CardHeader>
          <CardTitle className="text-[#F1F5F9]">Something went wrong</CardTitle>
          <CardDescription className="text-[#94A3B8]">
            An error occurred while loading the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#0A0F1C] p-4 rounded-lg">
            <p className="text-sm text-[#EF4444] font-mono">
              {error.message}
            </p>
          </div>
          <Button
            onClick={reset}
            className="w-full bg-[#00F5FF] text-[#0A0F1C] hover:bg-[#00D9FF]"
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
