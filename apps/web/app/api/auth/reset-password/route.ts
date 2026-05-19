import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { token, email, password } = await request.json();

    if (!token || !email || !password) {
      return NextResponse.json(
        { message: 'Token, email, and new password are required.' },
        { status: 400 }
      );
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const identifier = `password-reset:${normalizedEmail}`;

    // Look up the token
    const record = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!record || record.identifier !== identifier) {
      return NextResponse.json(
        { message: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    if (record.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.json(
        { message: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    const updated = await prisma.user.updateMany({
      where: { email: normalizedEmail },
      data: { password: hashedPassword },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { message: 'No account found for this email.' },
        { status: 404 }
      );
    }

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json(
      { message: 'Password updated successfully.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
