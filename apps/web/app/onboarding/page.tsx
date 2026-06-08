import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';

export const metadata = {
  title: 'Setup Your Unimatrix Palace',
  description: 'Complete onboarding to set up your encrypted memory vault in 5 minutes',
};

export default function OnboardingPage() {
  return (
    <main>
      <OnboardingFlow />
    </main>
  );
}
