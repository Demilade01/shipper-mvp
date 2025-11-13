import { NextRequest, NextResponse } from 'next/server';
import { getAccessTokenCookie, setSocketTokenCookie } from '@/lib/cookies';
import { getUserFromToken } from '@/lib/auth';

/**
 * GET /api/auth/socket-token
 * Returns the socket token for authenticated users
 * This endpoint ensures the socket_token cookie is set for client-side access
 */
export async function GET(request: NextRequest) {
  try {
    // Get access token from HttpOnly cookie
    const accessToken = await getAccessTokenCookie();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user
    const user = await getUserFromToken(accessToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Set socket token cookie (non-HttpOnly for client-side access)
    await setSocketTokenCookie(accessToken);

    return NextResponse.json({
      message: 'Socket token set successfully',
    });
  } catch (error) {
    console.error('Socket token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

