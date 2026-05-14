import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import PalaceGrid from '@/components/dashboard/PalaceGrid';

export const metadata = {
  title: 'Dashboard - Mempalace',
  description: 'Your memory palaces',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <AppShell>
      <div className="p-8">
        <PalaceGrid />
      </div>
    </AppShell>
  );
}
