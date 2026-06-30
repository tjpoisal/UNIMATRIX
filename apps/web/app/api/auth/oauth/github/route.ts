import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Verify the GitHub token with GitHub's API
    const githubResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!githubResponse.ok) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const githubData = await githubResponse.json();

    const email = githubData.email;
    const name = githubData.name || githubData.login;

    // If email is private, get it from the emails endpoint
    let userEmail = email;
    if (!userEmail) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const emailsData = await emailsResponse.json();
      const primaryEmail = emailsData.find((e: any) => e.primary && e.verified);
      userEmail = primaryEmail?.email;
    }

    if (!userEmail) {
      return NextResponse.json({ error: 'No verified email found' }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      user = await prisma.user.create({
        email: userEmail,
        name,
        tier: 'free',
        role: 'user',
        onboardingCompleted: false,
      });
    }

    // Check if this GitHub account is already linked
    const existingAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        provider: 'github',
        providerAccountId: String(githubData.id),
      },
    });

    if (!existingAccount) {
      await prisma.account.create({
        userId: user.id,
        type: 'oauth',
        provider: 'github',
        providerAccountId: String(githubData.id),
        access_token: token,
        refresh_token: null,
        expires_at: null,
      });
    } else {
      // Update the existing account
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          access_token: token,
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
    console.error('[OAuth] GitHub error:', error);
    return NextResponse.json({ error: 'OAuth failed' }, { status: 500 });
  }
}
