import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { getAccessTokenCookie } from '@/lib/cookies';
import { z } from 'zod';

// Schema for creating a message
const createMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  chatId: z.string().min(1, 'Chat ID is required'),
  receiverId: z.string().optional(), // For direct messages
  attachmentUrl: z.string().url().optional().nullable(),
  attachmentName: z.string().optional().nullable(),
  attachmentType: z.string().optional().nullable(),
  attachmentSize: z.number().int().positive().optional().nullable(),
});

/**
 * GET /api/messages?chatId=...
 * Get messages for a chat
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

    // Get chatId from query params
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      );
    }

    // Verify user is a participant in this chat
    const participant = await db.chatParticipant.findFirst({
      where: {
        chatId: chatId,
        userId: currentUser.id,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'You are not a participant in this chat' },
        { status: 403 }
      );
    }

    // Get messages for this chat
    const messages = await db.message.findMany({
      where: {
        chatId: chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return NextResponse.json({
      messages,
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Create a new message
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

    // Verify that either content or attachment exists
    if ((!body.content || !body.content.trim()) && !body.attachmentUrl) {
      return NextResponse.json(
        { error: 'Message content or attachment is required' },
        { status: 400 }
      );
    }

    // Create schema that allows empty content if attachment exists
    const messageSchema = createMessageSchema.extend({
      content: body.attachmentUrl
        ? z.string().min(0) // Allow empty if attachment exists
        : z.string().min(1, 'Message content is required'), // Require content if no attachment
    });

    const validationResult = messageSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { content, chatId, receiverId, attachmentUrl, attachmentName, attachmentType, attachmentSize } = validationResult.data;

    // Verify user is a participant in this chat
    if (chatId) {
      const participant = await db.chatParticipant.findFirst({
        where: {
          chatId: chatId,
          userId: currentUser.id,
        },
      });

      if (!participant) {
        return NextResponse.json(
          { error: 'You are not a participant in this chat' },
          { status: 403 }
        );
      }
    }

    // Create message (use emoji placeholder if no content but attachment exists)
    const messageContent = (content && content.trim()) || (attachmentUrl ? `📎 ${attachmentName || 'File'}` : '');

    const message = await db.message.create({
      data: {
        content: messageContent,
        senderId: currentUser.id,
        receiverId: receiverId || null,
        chatId: chatId || null,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        attachmentType: attachmentType || null,
        attachmentSize: attachmentSize || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update chat's updatedAt timestamp
    if (chatId) {
      await db.chat.update({
        where: { id: chatId },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json(
      {
        message,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

