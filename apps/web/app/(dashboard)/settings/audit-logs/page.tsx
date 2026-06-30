/**
 * Audit Log Viewer
 * 
 * Admin-only page to view system audit logs for security and compliance.
 */

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/middleware/rbac';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const dynamic = 'force-dynamic';

interface AuditLog {
  id: string;
  action: string;
  actorName: string | null;
  actorEmail: string | null;
  targetType: string | null;
  targetId: string | null;
  metadata: any;
  createdAt: Date;
}

export default async function AuditLogsPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  if (!isAdmin(session.user)) {
    return <div>Forbidden: Admin access required</div>;
  }

  // Fetch recent audit logs
  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          System-wide audit trail for security and compliance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Last 100 audit log entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogTable logs={logs} />
        </CardContent>
      </Card>
    </div>
  );
}

function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.actorName?.toLowerCase().includes(filter.toLowerCase()) ||
      log.actorEmail?.toLowerCase().includes(filter.toLowerCase()) ||
      log.targetType?.toLowerCase().includes(filter.toLowerCase());

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const actionOptions = Array.from(new Set(logs.map(l => l.action))).slice(0, 20);

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="max-w-xs">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionOptions.map(action => (
              <SelectItem key={action} value={action}>
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">Timestamp</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Action</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Actor</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Target</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="px-4 py-2 text-sm">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-sm">
                  <Badge variant="outline">{log.action}</Badge>
                </td>
                <td className="px-4 py-2 text-sm">
                  <div>
                    <div className="font-medium">{log.actorName || 'System'}</div>
                    <div className="text-xs text-muted-foreground">{log.actorEmail || '-'}</div>
                  </div>
                </td>
                <td className="px-4 py-2 text-sm">
                  {log.targetType && (
                    <div>
                      <div className="font-medium">{log.targetType}</div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {log.targetId?.slice(0, 8)}...
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 text-sm">
                  {Object.keys(log.metadata || {}).length > 0 && (
                    <details className="cursor-pointer">
                      <summary className="text-blue-500 hover:underline">View metadata</summary>
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No audit logs found matching your filters
        </div>
      )}
    </div>
  );
}
