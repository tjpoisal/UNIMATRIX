/**
 * Role Management
 * 
 * Admin-only page to manage user roles (user, admin, superadmin).
 */

import React, { useState } from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin, isSuperAdmin } from '@/lib/middleware/rbac';
import { updateUserRole } from './actions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

export default async function RolesPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  if (!isAdmin(session.user)) {
    return <div>Forbidden: Admin access required</div>;
  }

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <p className="text-muted-foreground">
          Manage user roles and permissions
        </p>
      </div>

      {!isSuperAdmin(session.user) && (
        <Alert className="mb-6">
          <AlertDescription>
            You can only manage user roles. Contact a superadmin to manage admin or superadmin roles.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            Manage user roles for access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserTable users={users} currentUserId={session.user.id} isSuperAdmin={isSuperAdmin(session.user)} />
        </CardContent>
      </Card>
    </div>
  );
}

function UserTable({ users, currentUserId, isSuperAdmin }: { users: User[]; currentUserId: string; isSuperAdmin: boolean }) {
  const [filter, setFilter] = useState('');

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(filter.toLowerCase()) ||
    user.name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search users..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium">User</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Current Role</th>
              <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2 text-sm font-medium">{user.name || '-'}</td>
                <td className="px-4 py-2 text-sm">{user.email}</td>
                <td className="px-4 py-2 text-sm">
                  <Badge variant={user.role === 'superadmin' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role}
                  </Badge>
                </td>
                <td className="px-4 py-2 text-sm">
                  {user.id !== currentUserId && (
                    <RoleSelect
                      userId={user.id}
                      currentRole={user.role}
                      isSuperAdmin={isSuperAdmin}
                    />
                  )}
                  {user.id === currentUserId && (
                    <span className="text-muted-foreground text-xs">Cannot change your own role</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No users found matching your search
        </div>
      )}
    </div>
  );
}

function RoleSelect({ userId, currentRole, isSuperAdmin }: { userId: string; currentRole: string; isSuperAdmin: boolean }) {
  const [isLoading, setIsLoading] = useState(false);

  const availableRoles = isSuperAdmin
    ? ['user', 'admin', 'superadmin']
    : ['user'];

  const handleChange = async (newRole: string) => {
    setIsLoading(true);
    const result = await updateUserRole(userId, newRole);
    if (result.error) {
      alert(result.error);
    }
    setIsLoading(false);
  };

  return (
    <Select
      defaultValue={currentRole}
      onValueChange={handleChange}
      disabled={isLoading}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {availableRoles.map((role) => (
          <SelectItem key={role} value={role}>
            {role}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
