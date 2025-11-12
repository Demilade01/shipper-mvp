import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { getAccessTokenCookie } from '@/lib/cookies';

/**
 * GET /api/users
 * Get all users (for user list sidebar)
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from token
    const accessToken = await getAccessTokenCookie();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentUser = await getUserFromToken(accessToken);
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all users except current user
    const users = await db.user.findMany({
      where: {
        id: {
          not: currentUser.id,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      users,
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

