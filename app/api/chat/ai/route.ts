import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAccessTokenCookie } from '@/lib/cookies';
import { getUserFromToken } from '@/lib/auth';
import { getOrCreateAIUser, AI_USER_EMAIL } from '@/lib/ai-user';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// System prompt for AI assistant
const SYSTEM_PROMPT = `You are a helpful AI assistant in a chat application. Be friendly, concise, and helpful.
Keep your responses conversational and appropriate for a chat setting.
If asked about topics you don't know about, be honest about your limitations.`;

/**
 * POST /api/chat/ai
 * Send a message to the AI assistant and get a response
 */
export async function POST(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = await getAccessTokenCookie();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user from token
    const user = await getUserFromToken(accessToken);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, chatId } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get or create AI user
    const aiUser = await getOrCreateAIUser();

    // Get or create chat with AI
    let chat;
    if (chatId) {
      // Verify chat exists and user is a participant
      chat = await db.chat.findFirst({
        where: {
          id: chatId,
          participants: {
            some: {
              userId: user.id,
            },
          },
        },
        include: {
          participants: true,
        },
      });

      if (!chat) {
        return NextResponse.json(
          { error: 'Chat not found' },
          { status: 404 }
        );
      }
    } else {
      // Create new chat with AI
      chat = await db.chat.create({
        data: {
          participants: {
            create: [
              { userId: user.id },
              { userId: aiUser.id },
            ],
          },
        },
        include: {
          participants: true,
        },
      });
    }

    // Save user's message to database
    const userMessage = await db.message.create({
      data: {
        content: message.trim(),
        senderId: user.id,
        receiverId: aiUser.id,
        chatId: chat.id,
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
      },
    });

    // Get conversation history (last 20 messages for context)
    const recentMessages = await db.message.findMany({
      where: {
        chatId: chat.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 20,
      include: {
        sender: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // Build messages array for OpenAI
    const openAIMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    // Add conversation history
    for (const msg of recentMessages) {
      if (msg.sender.email === AI_USER_EMAIL) {
        openAIMessages.push({
          role: 'assistant',
          content: msg.content,
        });
      } else {
        openAIMessages.push({
          role: 'user',
          content: msg.content,
        });
      }
    }

    // Check if OpenAI API key is configured
    if (!openai) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 503 }
      );
    }

    // Get AI response from OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: openAIMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponseContent = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';

    // Save AI response to database
    const aiMessage = await db.message.create({
      data: {
        content: aiResponseContent.trim(),
        senderId: aiUser.id,
        receiverId: user.id,
        chatId: chat.id,
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
      },
    });

    // Update chat's updatedAt
    await db.chat.update({
      where: { id: chat.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      message: aiMessage,
      chatId: chat.id,
    });
  } catch (error: any) {
    console.error('AI chat error:', error);

    // Handle OpenAI API errors
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: 'AI service error', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

