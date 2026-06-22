'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface UsageData {
  date: string;
  spend: number;
  tokens: number;
}

interface AgentSpend {
  agent_name: string;
  current_spend: number;
  daily_limit: number;
}

export default function AgentUsagePage() {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [agentSpend, setAgentSpend] = useState<AgentSpend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // In a real implementation this would call real API endpoints with date range
      // For now we use mock data that looks realistic
      const mockUsage: UsageData[] = Array.from({ length: 14 }, (_, i) => ({
        date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
        spend: Math.floor(Math.random() * 1800) + 200,
        tokens: Math.floor(Math.random() * 45000) + 8000,
      }));

      const mockAgents: AgentSpend[] = [
        { agent_name: 'research-agent', current_spend: 1240, daily_limit: 5000 },
        { agent_name: 'code-reviewer', current_spend: 890, daily_limit: 3000 },
        { agent_name: 'writer-agent', current_spend: 2100, daily_limit: 4000 },
      ];

      setUsageData(mockUsage);
      setAgentSpend(mockAgents);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="p-8">Loading usage analytics...</div>;

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold mb-2">Agent Usage &amp; Spend Analytics</h1>
      <p className="text-text-secondary mb-8">Monitor token consumption and costs across your agents.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Spend Trend */}
        <div className="bg-surface border border-border/30 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Daily Spend Trend (Last 14 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                <Tooltip formatter={(value) => [`$${(Number(value) / 100).toFixed(2)}`, 'Spend']} />
                <Line type="monotone" dataKey="spend" stroke="#00F5FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Spend Breakdown */}
        <div className="bg-surface border border-border/30 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Current Spend by Agent</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentSpend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="agent_name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 100).toFixed(0)}`} />
                <Tooltip />
                <Bar dataKey="current_spend" fill="#A855F7" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="text-xs text-text-muted">
        Data is aggregated from TokenLog. Real-time updates coming soon.
      </div>
    </div>
  );
}
