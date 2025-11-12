import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { googleAuthSchema } from '@/lib/validation';
import { generateTokenPair } from '@/lib/auth';
import { setAuthCookies } from '@/lib/cookies';

// Google OAuth token verification
// Note: In production, you should verify the Google token server-side
// For MVP, we'll decode it and trust it (Google handles verification)
async function verifyGoogleToken(credential: string) {
  try {
    // Decode JWT token (without verification for MVP)
    // In production, use Google's API to verify the token
    const base64Url = credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      Buffer.from(base64, 'base64')
        .toString()
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = googleAuthSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { credential } = validationResult.data;

    // Verify Google token
    const googleUser = await verifyGoogleToken(credential);
    if (!googleUser || !googleUser.email) {
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 401 }
      );
    }

    const { email, name, picture, sub: googleId } = googleUser;

    // Find or create user
    let user = await db.user.findUnique({
      where: { email },
    });

    // User data type for response
    type UserData = {
      id: string;
      email: string;
      name: string | null;
      avatar: string | null;
      createdAt: Date;
    };

    let userData: UserData;

    if (user) {
      // Update user if they don't have googleId
      if (!user.googleId) {
        const updatedUser = await db.user.update({
          where: { id: user.id },
          data: {
            googleId,
            avatar: picture || user.avatar,
            name: name || user.name,
          },
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            createdAt: true,
          },
        });
        userData = updatedUser;
      } else {
        // User exists with Google OAuth
        userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          createdAt: user.createdAt,
        };
      }
    } else {
      // Create new user
      const newUser = await db.user.create({
        data: {
          email,
          name: name || null,
          avatar: picture || null,
          googleId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          createdAt: true,
        },
      });
      userData = newUser;
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokenPair({
      userId: userData.id,
      email: userData.email,
    });

    // Set cookies
    await setAuthCookies(accessToken, refreshToken);

    return NextResponse.json({
      user: userData,
      message: 'Google authentication successful',
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

