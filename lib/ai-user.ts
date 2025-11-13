import { db } from './db';

/**
 * AI System User Email
 */
export const AI_USER_EMAIL = 'ai@system.local';

/**
 * Get or create AI system user
 */
export async function getOrCreateAIUser() {
  try {
    // Try to find existing AI user
    let aiUser = await db.user.findUnique({
      where: { email: AI_USER_EMAIL },
    });

    // If not found, create it
    if (!aiUser) {
      aiUser = await db.user.create({
        data: {
          email: AI_USER_EMAIL,
          name: 'AI Assistant',
          avatar: null,
          password: null, // AI user doesn't need password
          googleId: null, // AI user doesn't use Google OAuth
        },
      });
    }

    return aiUser;
  } catch (error) {
    console.error('Error getting/creating AI user:', error);
    throw error;
  }
}

/**
 * Check if a user ID is the AI user
 */
export async function isAIUser(userId: string): Promise<boolean> {
  try {
    const aiUser = await getOrCreateAIUser();
    return aiUser.id === userId;
  } catch (error) {
    return false;
  }
}

/**
 * Get AI user ID
 */
export async function getAIUserId(): Promise<string | null> {
  try {
    const aiUser = await getOrCreateAIUser();
    return aiUser.id;
  } catch (error) {
    return null;
  }
}

