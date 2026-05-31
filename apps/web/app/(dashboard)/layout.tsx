import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  return <AppShell>{children}</AppShell>;
}
