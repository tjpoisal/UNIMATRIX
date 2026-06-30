import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token, idToken } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Verify the Google token with Google's API
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${token}`);
    const googleData = await googleResponse.json();

    if (googleData.error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const email = googleData.email;
    const name = googleData.name || email.split('@')[0];

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          tier: 'free',
          role: 'user',
          onboardingCompleted: false,
        },
      });
    }

    // Check if this Google account is already linked
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'google',
        providerAccountId: googleData.sub,
      },
    });

    if (!existingAccount) {
      await prisma.account.create({
        data: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleData.sub,
          access_token: token,
          refresh_token: null,
          expires_at: googleData.expires_in ? Math.floor(Date.now() / 1000) + googleData.expires_in : null,
        },
      });
    } else {
      // Update the existing account
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          access_token: token,
          expires_at: googleData.expires_in ? Math.floor(Date.now() / 1000) + googleData.expires_in : null,
        },
      });
    }

    // Return user data (mobile app will need to complete login flow)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tier: user.tier,
      },
    });
  } catch (error: any) {
    console.error('[OAuth] Google error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
