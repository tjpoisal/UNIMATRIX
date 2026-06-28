import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import PalaceGrid from '@/components/dashboard/PalaceGrid';
import ContinueSessionButton from '@/components/dashboard/ContinueSessionButton';

export const metadata = {
  title: 'Dashboard - Unimatrix',
  description: 'Your AI memory workspaces',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <AppShell>
      <div className="p-8">
        <ContinueSessionButton />
        <PalaceGrid />
      </div>
    </AppShell>
  );
}
