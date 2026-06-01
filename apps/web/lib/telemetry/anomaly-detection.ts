/**
 * Simple Anomaly Detection for Agent Spend
 */

import { prisma } from '@/lib/prisma';

export async function detectSpendAnomalies(organizationId: string) {
  const recentLogs = await prisma.tokenLog.findMany({
    where: {
      room: { organizationId },
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 4) }, // last 4 hours
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const anomalies: any[] = [];

  // Very simple heuristic: 5x average spend in last hour vs previous 3 hours
  const grouped = recentLogs.reduce((acc: any, log) => {
    const hour = Math.floor(log.createdAt.getTime() / (1000 * 60 * 60));
    if (!acc[hour]) acc[hour] = 0;
    acc[hour] += log.cost_in_cents;
    return acc;
  }, {});

  const hours = Object.keys(grouped).map(Number).sort((a, b) => b - a);
  if (hours.length >= 2) {
    const latest = grouped[hours[0]];
    const previousAvg = hours.slice(1, 4).reduce((sum, h) => sum + (grouped[h] || 0), 0) / Math.max(1, hours.length - 1);

    if (latest > previousAvg * 5 && latest > 500) {
      anomalies.push({
        type: 'spend_spike',
        severity: 'high',
        message: `Unusual spend spike detected for organization (latest hour: $${(latest / 100).toFixed(2)})`,
        value: latest,
      });
    }
  }

  return anomalies;
}
