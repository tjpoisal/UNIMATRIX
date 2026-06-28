'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';

type AnalyticsResponse = {
  totalMemories: number;
  byTier: { hot: number; warm: number; cold: number; archive: number };
  bySource: Record<string, number>;
  createdByDay: Array<{ date: string; count: number }>;
  topTags: Array<{ tag: string; count: number }>;
  totalRecalls: number;
  estimatedTokensSaved: number;
  topRecalled?: Array<{ id: string; recalls: number }>;
  auditLog?: Array<{ id: string; action: string; actorName: string | null; createdAt: string }>;
};

const PIE_COLORS = ['#00F5FF', '#38BDF8', '#A78BFA', '#22C55E', '#F59E0B', '#EF4444'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsResponse | null>(null);

  useEffect(() => {
    fetch('/api/analytics').then((res) => res.json()).then(setData).catch(() => setData(null));
  }, []);

  const byTierData = useMemo(() => {
    if (!data) return [];
    return [
      { tier: 'HOT', count: data.byTier.hot },
      { tier: 'WARM', count: data.byTier.warm },
      { tier: 'COLD', count: data.byTier.cold },
      { tier: 'ARCHIVE', count: data.byTier.archive },
    ];
  }, [data]);

  const bySourceData = useMemo(
    () => Object.entries(data?.bySource ?? {}).map(([source, count]) => ({ source, count })),
    [data],
  );

  if (!data) {
    return <div className="p-8 text-[#94A3B8]">Loading analytics…</div>;
  }

  return (
    <main className="p-8 space-y-8 bg-[#0A0F1C] min-h-screen text-[#F1F5F9]">
      <h1 className="text-3xl font-bold">Memory Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#111827] p-4 rounded border border-[#334155]/30">Total memories: {data.totalMemories}</div>
        <div className="bg-[#111827] p-4 rounded border border-[#334155]/30">Total recalls: {data.totalRecalls}</div>
        <div className="bg-[#111827] p-4 rounded border border-[#334155]/30">Estimated tokens saved: {data.estimatedTokensSaved}</div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] p-4 rounded border border-[#334155]/30 h-72">
          <h2 className="mb-2 font-semibold">Memories by Storage Tier</h2>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={byTierData}>
              <XAxis dataKey="tier" stroke="#94A3B8" />
              <YAxis stroke="#94A3B8" />
              <Tooltip />
              <Bar dataKey="count" fill="#00F5FF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#111827] p-4 rounded border border-[#334155]/30 h-72">
          <h2 className="mb-2 font-semibold">Memories by Source LLM</h2>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={bySourceData} dataKey="count" nameKey="source" outerRadius={100}>
                {bySourceData.map((entry, index) => (
                  <Cell key={entry.source} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-[#111827] p-4 rounded border border-[#334155]/30 h-80">
        <h2 className="mb-2 font-semibold">Memory Creation (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data.createdByDay}>
            <XAxis dataKey="date" stroke="#94A3B8" hide />
            <YAxis stroke="#94A3B8" />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#00F5FF" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#111827] p-4 rounded border border-[#334155]/30">
          <h2 className="mb-2 font-semibold">Top Tags</h2>
          <div className="space-y-2">
            {data.topTags.slice(0, 12).map((tag) => (
              <div key={tag.tag} className="flex items-center gap-2">
                <span className="w-40 truncate text-[#94A3B8]">{tag.tag}</span>
                <div className="flex-1 bg-[#1F2937] rounded h-2">
                  <div className="h-2 bg-[#00F5FF] rounded" style={{ width: `${Math.min(100, tag.count * 10)}%` }} />
                </div>
                <span className="text-xs">{tag.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#111827] p-4 rounded border border-[#334155]/30">
          <h2 className="mb-2 font-semibold">Retrieval Frequency Heatmap</h2>
          <div className="grid grid-cols-5 gap-2">
            {(data.topRecalled ?? []).slice(0, 20).map((item) => (
              <div
                key={item.id}
                title={`${item.id}: ${item.recalls}`}
                className="h-10 rounded border border-[#334155]/30"
                style={{ backgroundColor: `rgba(0,245,255,${Math.min(0.95, 0.2 + item.recalls * 0.2)})` }}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#111827] p-4 rounded border border-[#334155]/30">
        <h2 className="mb-3 font-semibold">Audit Log</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#94A3B8]">
                <th className="py-2">Action</th>
                <th className="py-2">Actor</th>
                <th className="py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {(data.auditLog ?? []).map((row) => (
                <tr key={row.id} className="border-t border-[#334155]/30">
                  <td className="py-2">{row.action}</td>
                  <td className="py-2">{row.actorName ?? 'system'}</td>
                  <td className="py-2">{new Date(row.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
