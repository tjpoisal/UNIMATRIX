import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export const metadata = {
  title: 'Setup Your Unimatrix Palace',
  description: 'Complete onboarding to set up your encrypted memory vault in 5 minutes',
};

export default async function OnboardingPage() {
  const session = await auth();
  if (session?.user?.onboardingComplete) {
    redirect('/dashboard');
  }

  return (
    <main>
      <OnboardingFlow />
    </main>
  );
}
