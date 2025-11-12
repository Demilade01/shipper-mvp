'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useChats } from '@/hooks/useChats';
import { useQueryClient } from '@tanstack/react-query';
import { UserList } from '@/components/chat/UserList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { ChatInput } from '@/components/chat/ChatInput';
import { Loader2 } from 'lucide-react';
import type { Chat } from '@/hooks/useChats';

export default function ChatPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: users } = useUsers();
  const { data: chats, refetch: refetchChats } = useChats();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Find or create chat when user is selected
  useEffect(() => {
    if (!selectedUserId) {
      setCurrentChat(null);
      return;
    }

    // Find existing chat with this user
    if (chats) {
      const chat = chats.find((chat) =>
        chat.participants.some((p) => p.id === selectedUserId)
      );

      if (chat) {
        setCurrentChat(chat);
        return;
      }
    }

    // Chat doesn't exist yet - will be created when first message is sent
    // For now, set currentChat to null so ChatWindow shows empty state
    setCurrentChat(null);
  }, [selectedUserId, chats]);

  // Handle chat creation from ChatInput
  const handleChatCreated = async (chatId: string) => {
    // Refetch chats to get the new chat
    await refetchChats();
    // Find and set the new chat
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    // The useEffect will update currentChat when chats are refetched
  };

  // Get receiver info
  const receiver = users?.find((u) => u.id === selectedUserId);
  const receiverId = receiver?.id;
  const receiverName = receiver?.name || undefined;
  const receiverEmail = receiver?.email;
  const receiverAvatar = receiver?.avatar || undefined;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-[#f9f9f9]">
      <div className="flex-1 flex overflow-hidden">
        {/* User list sidebar */}
        <div className="w-80 border-r bg-white flex flex-col">
          <UserList
            onUserSelect={setSelectedUserId}
            selectedUserId={selectedUserId || undefined}
          />
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col">
          <ChatWindow
            chatId={currentChat?.id || null}
            receiverId={receiverId}
            receiverName={receiverName}
            receiverEmail={receiverEmail}
            receiverAvatar={receiverAvatar}
          />
          <ChatInput
            chatId={currentChat?.id || null}
            receiverId={receiverId}
            onChatCreated={handleChatCreated}
          />
        </div>
      </div>
    </div>
  );
}

