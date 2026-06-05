import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { connectToken } = await request.json();

    if (!connectToken) {
      return NextResponse.json({ error: "connectToken is required" }, { status: 400 });
    }

    // Find the token
    const verification = await prisma.verificationToken.findFirst({
      where: {
        token: connectToken,
        identifier: {
          startsWith: "mobile_connect:",
        },
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return NextResponse.json({ error: "Invalid or expired connect token" }, { status: 401 });
    }

    // Extract userId
    const userId = verification.identifier.split(":")[1];

    // Delete the used token (one-time use)
    await prisma.verificationToken.delete({
      where: { token: connectToken },
    });

    // Create a fresh Unimatrix API key for this mobile device (so full key isn't exposed in QR)
    const raw = "umx_" + randomBytes(16).toString("hex");
    const keyHash = await bcrypt.hash(raw, 10);
    const keyPrefix = raw.slice(0, 12);

    const apiKey = await prisma.apiKey.create({
      data: {
        userId,
        name: "Mobile Device (auto)",
        keyHash,
        keyPrefix,
      },
    });

    // Optionally, we could also return user info, but for mobile apikey login, the raw key is sufficient
    return NextResponse.json({
      key: raw, // Full key for mobile to use as authToken (only returned once via this exchange)
      keyPrefix: apiKey.keyPrefix,
      message: "Mobile connect successful. Use the key to authenticate.",
    }, { status: 201 });

  } catch (error) {
    console.error("Exchange mobile connect error:", error);
    return NextResponse.json({ error: "Failed to exchange token" }, { status: 500 });
  }
}
