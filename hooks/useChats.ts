'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ChatParticipant {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  sender: ChatParticipant;
  createdAt: string;
}

export interface Chat {
  id: string;
  participants: ChatParticipant[];
  lastMessage: LastMessage | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all chats for current user
 */
async function getChats(): Promise<Chat[]> {
  const response = await fetch('/api/chats');
  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }
  const data = await response.json();
  return data.chats;
}

/**
 * Create a new chat
 */
async function createChat(userId: string): Promise<Chat> {
  const response = await fetch('/api/chats', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create chat');
  }
  const data = await response.json();
  return data.chat;
}

/**
 * Custom hook for fetching chats
 */
export function useChats() {
  return useQuery({
    queryKey: ['chats'],
    queryFn: getChats,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Custom hook for creating a chat
 */
export function useCreateChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });
}

