import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * Mark user as having completed onboarding
 * POST /api/user/onboarding-complete
 */
export async function POST(_req: NextRequest) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to mark onboarding complete:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}