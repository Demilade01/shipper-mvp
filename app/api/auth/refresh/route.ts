import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, signAccessToken } from '@/lib/auth';
import { getRefreshTokenCookie, setAccessTokenCookie, setSocketTokenCookie } from '@/lib/cookies';

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = await getRefreshTokenCookie();

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired refresh token' },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = signAccessToken({
      userId: payload.userId,
      email: payload.email,
    });

    // Set new access token cookies (both HttpOnly and non-HttpOnly for Socket.io)
    await setAccessTokenCookie(accessToken);
    await setSocketTokenCookie(accessToken);

    return NextResponse.json({
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

