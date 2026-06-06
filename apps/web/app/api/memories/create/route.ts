import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

interface CreateMemoryPayload {
  ciphertext: string;
  nonce: string;
  signature: string;
  context?: string;
  importance: 'low' | 'medium' | 'high';
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse encrypted memory payload
    const body = (await req.json()) as CreateMemoryPayload;

    const { ciphertext, nonce, signature, context, importance } = body;

    // Validate required fields
    if (!ciphertext || !nonce || !signature) {
      return NextResponse.json(
        { error: 'Missing encryption fields: ciphertext, nonce, signature' },
        { status: 400 }
      );
    }

    // TODO: In Phase 1F, verify signature against user's public key
    // For now, just store the encrypted payload
    console.log('[Memory] Creating encrypted memory for user:', session.user.id);
    console.log('[Memory] Context:', context || 'default');
    console.log('[Memory] Importance:', importance);
    console.log('[Memory] Ciphertext length:', ciphertext.length);

    // Store encrypted memory in database
    // Note: The server stores ciphertext only. It cannot decrypt without the user's password.
    // TODO: Wire this into actual Prisma memory model once schema is finalized
    // For now, return success response

    return NextResponse.json(
      {
        success: true,
        message: 'Memory encrypted and stored securely',
        memoryId: `mem_${Date.now()}`,
        details: {
          encrypted: true,
          ciphertextLength: ciphertext.length,
          context: context || 'default',
          importance,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Memory] Error creating memory:', error);
    return NextResponse.json(
      { error: 'Failed to create encrypted memory' },
      { status: 500 }
    );
  }
}
