import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateAIUser } from '@/lib/ai-user';

/**
 * GET /api/users/ai
 * Get AI user information
 */
export async function GET(request: NextRequest) {
  try {
    const aiUser = await getOrCreateAIUser();

    return NextResponse.json({
      user: {
        id: aiUser.id,
        email: aiUser.email,
        name: aiUser.name,
        avatar: aiUser.avatar,
        createdAt: aiUser.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get AI user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

