import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { getAccessTokenCookie } from '@/lib/cookies';
import { z } from 'zod';

// Schema for creating a chat
const createChatSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

/**
 * GET /api/chats
 * Get all chats for the current user
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

    // Get all chats for the current user
    const chatParticipants = await db.chatParticipant.findMany({
      where: {
        userId: currentUser.id,
      },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        chat: {
          updatedAt: 'desc',
        },
      },
    });

    // Format chats
    const chats = chatParticipants.map((cp: typeof chatParticipants[0]) => {
      const otherParticipants = cp.chat.participants.filter(
        (p: typeof cp.chat.participants[0]) => p.userId !== currentUser.id
      );
      const lastMessage = cp.chat.messages[0] || null;

      return {
        id: cp.chat.id,
        participants: otherParticipants.map((p: typeof otherParticipants[0]) => p.user),
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              sender: lastMessage.sender,
              createdAt: lastMessage.createdAt,
            }
          : null,
        createdAt: cp.chat.createdAt,
        updatedAt: cp.chat.updatedAt,
      };
    });

    return NextResponse.json({
      chats,
    });
  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/chats
 * Create a new chat session with a user
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const validationResult = createChatSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { userId } = validationResult.data;

    // Check if user exists
    const otherUser = await db.user.findUnique({
      where: { id: userId },
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if chat already exists between these two users
    const existingChat = await db.chatParticipant.findFirst({
      where: {
        userId: currentUser.id,
        chat: {
          participants: {
            some: {
              userId: userId,
            },
          },
        },
      },
      include: {
        chat: {
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (existingChat) {
      // Return existing chat
      const otherParticipants = existingChat.chat.participants.filter(
        (p: typeof existingChat.chat.participants[0]) => p.userId !== currentUser.id
      );

      return NextResponse.json({
        chat: {
          id: existingChat.chat.id,
          participants: otherParticipants.map((p: typeof otherParticipants[0]) => p.user),
          lastMessage: null,
          createdAt: existingChat.chat.createdAt,
          updatedAt: existingChat.chat.updatedAt,
        },
      });
    }

    // Create new chat
    const chat = await db.chat.create({
      data: {
        participants: {
          create: [
            {
              userId: currentUser.id,
            },
            {
              userId: userId,
            },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Format chat
    const otherParticipants = chat.participants.filter(
      (p: typeof chat.participants[0]) => p.userId !== currentUser.id
    );

    return NextResponse.json(
      {
        chat: {
          id: chat.id,
          participants: otherParticipants.map((p: typeof otherParticipants[0]) => p.user),
          lastMessage: null,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

