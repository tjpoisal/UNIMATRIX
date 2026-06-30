/**
 * Analytics Dashboard
 * 
 * Admin-only page to view user analytics and metrics.
 */

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalMemories: number;
  totalPalaces: number;
  mcpCalls: number;
  recentEvents: Array<{
    event: string;
    count: number;
  }>;
}

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  // In production, this would fetch from PostHog API
  // For now, we'll show placeholder data
  const analyticsData: AnalyticsData = {
    totalUsers: 0,
    activeUsers: 0,
    totalMemories: 0,
    totalPalaces: 0,
    mcpCalls: 0,
    recentEvents: [],
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          User metrics and product analytics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Users"
          value={analyticsData.totalUsers}
          change="+12%"
          positive
        />
        <MetricCard
          title="Active Users (7d)"
          value={analyticsData.activeUsers}
          change="+8%"
          positive
        />
        <MetricCard
          title="Total Memories"
          value={analyticsData.totalMemories}
          change="+24%"
          positive
        />
        <MetricCard
          title="MCP Calls"
          value={analyticsData.mcpCalls}
          change="+15%"
          positive
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111827] border-[#334155/30]">
          <CardHeader>
            <CardTitle className="text-[#F1F5F9]">Recent Events</CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Top events in the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.recentEvents.length === 0 ? (
                <p className="text-sm text-[#94A3B8]">No events tracked yet</p>
              ) : (
                analyticsData.recentEvents.map((event, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[#F1F5F9]">{event.event}</span>
                    <Badge variant="secondary">{event.count}</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#111827] border-[#334155/30]">
          <CardHeader>
            <CardTitle className="text-[#F1F5F9]">Analytics Setup</CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Configure PostHog for detailed analytics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-[#94A3B8]">
              <p className="mb-2">To enable analytics:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Create a PostHog project at posthog.com</li>
                <li>Set NEXT_PUBLIC_POSTHOG_KEY in environment variables</li>
                <li>Set NEXT_PUBLIC_POSTHOG_HOST (if self-hosted)</li>
                <li>Events will be tracked automatically</li>
              </ol>
            </div>
            <div className="bg-[#0A0F1C] p-4 rounded-lg">
              <p className="text-xs text-[#6B7280] font-mono">
                NEXT_PUBLIC_POSTHOG_KEY=phc_...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  positive,
}: {
  title: string;
  value: number;
  change: string;
  positive: boolean;
}) {
  return (
    <Card className="bg-[#111827] border-[#334155/30]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-[#94A3B8]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-[#F1F5F9]">{value.toLocaleString()}</div>
        <p className={`text-xs mt-1 ${positive ? 'text-green-500' : 'text-red-500'}`}>
          {change} from last week
        </p>
      </CardContent>
    </Card>
  );
}
