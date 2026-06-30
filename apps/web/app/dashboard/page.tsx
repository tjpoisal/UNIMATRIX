import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import AppShell from '@/components/layout/AppShell';
import PalaceGrid from '@/components/dashboard/PalaceGrid';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Dashboard - Unimatrix',
  description: 'Your AI memory workspaces',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login');
  }

  // Check if user needs onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true },
  });

  // Redirect to onboarding if user hasn't completed it
  if (!user?.onboardingCompleted) {
    redirect('/onboarding');
  }

  return (
    <AppShell>
      <div className="p-8">
        <PalaceGrid />
      </div>
    </AppShell>
  );
}
