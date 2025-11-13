'use client';

import { useState, useRef, useEffect } from 'react';
import { useCreateMessage } from '@/hooks/useMessages';
import { useCreateChat } from '@/hooks/useChats';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  chatId: string | null;
  receiverId?: string;
  onChatCreated?: (chatId: string) => void;
}

export function ChatInput({ chatId, receiverId, onChatCreated }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { mutateAsync: createMessage, isPending: isSending } = useCreateMessage();
  const { mutateAsync: createChat, isPending: isCreatingChat } = useCreateChat();
  const { socket } = useSocket();
  const inputRef = useRef<HTMLInputElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId);

  // Update currentChatId when chatId prop changes
  useEffect(() => {
    setCurrentChatId(chatId);
  }, [chatId]);

  const isPending = isSending || isCreatingChat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !receiverId || isPending) return;

    const messageContent = message.trim();
    setMessage('');

    try {
      let actualChatId = currentChatId;

      // Create chat if it doesn't exist
      if (!actualChatId && receiverId) {
        const chat = await createChat(receiverId);
        actualChatId = chat.id;
        setCurrentChatId(actualChatId);
        if (onChatCreated) {
          onChatCreated(actualChatId);
        }
      }

      if (!actualChatId) {
        throw new Error('Chat ID is required');
      }

      // Prefer Socket.io for real-time messaging (saves to DB and broadcasts)
      // Fallback to API if Socket.io is not connected
      if (socket && socket.connected) {
        // Send via Socket.io (server will save to DB and broadcast)
        socket.emit('sendMessage', {
          content: messageContent,
          chatId: actualChatId,
          receiverId,
        });
      } else {
        // Fallback to API if Socket.io is not connected
        await createMessage({
          content: messageContent,
          chatId: actualChatId,
          receiverId,
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageContent);
    }
  };

  // Handle typing indicator
  useEffect(() => {
    if (!socket || !chatId) return;

    const timeout = setTimeout(() => {
      if (message.trim()) {
        socket.emit('typing', { chatId, isTyping: true });
      } else {
        socket.emit('typing', { chatId, isTyping: false });
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (socket && chatId) {
        socket.emit('typing', { chatId, isTyping: false });
      }
    };
  }, [message, socket, chatId]);

  if (!receiverId) {
    return null;
  }

  return (
    <div className="p-4 border-t bg-white shrink-0">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isPending}
          className="flex-1"
          autoFocus
        />
        <Button
          type="submit"
          disabled={!message.trim() || isPending}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

