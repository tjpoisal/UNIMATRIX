import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail, passwordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Always return 200 to prevent email enumeration attacks
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Delete any existing reset token for this email
      await prisma.verificationToken.deleteMany({
        where: { identifier: `password-reset:${normalizedEmail}` },
      });

      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.verificationToken.create({
        data: {
          identifier: `password-reset:${normalizedEmail}`,
          token,
          expires,
        },
      });

      // Build reset URL
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

      // Send the email
      const emailContent = passwordResetEmail(resetUrl, normalizedEmail);
      await sendEmail({
        to: normalizedEmail,
        subject: emailContent.subject,
        html: emailContent.html,
      });
    }

    // Always return the same response
    return NextResponse.json(
      { message: 'If an account exists for that email, a reset link has been sent.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
