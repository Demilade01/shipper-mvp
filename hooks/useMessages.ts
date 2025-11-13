'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface MessageSender {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string | null;
  chatId: string | null;
  createdAt: string;
  sender: MessageSender;
  receiver: MessageSender | null;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number | null;
}

/**
 * Get messages for a chat
 */
async function getMessages(chatId: string): Promise<Message[]> {
  const response = await fetch(`/api/messages?chatId=${chatId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }
  const data = await response.json();
  return data.messages;
}

/**
 * Create a new message
 */
async function createMessage(data: {
  content: string;
  chatId: string;
  receiverId?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  attachmentSize?: number;
}): Promise<Message> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send message');
  }
  const result = await response.json();
  return result.message;
}

/**
 * Custom hook for fetching messages
 */
export function useMessages(chatId: string | null) {
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => getMessages(chatId!),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always refetch messages
  });
}

/**
 * Custom hook for creating a message
 */
export function useCreateMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMessage,
    onSuccess: (data) => {
      // Invalidate messages query for the chat
      if (data.chatId) {
        queryClient.invalidateQueries({ queryKey: ['messages', data.chatId] });
        queryClient.invalidateQueries({ queryKey: ['chats'] });
      }
    },
  });
}

