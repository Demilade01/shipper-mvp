'use client';

import { useRouter } from 'next/navigation';
import { useUsers } from '@/hooks/useUsers';
import { useAIUser } from '@/hooks/useAIUser';
import { useCreateChat, useChats } from '@/hooks/useChats';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Circle, Bot, LogOut } from 'lucide-react';
import { User } from '@/hooks/useUsers';
import { getMessages } from '@/hooks/useMessages';

interface UserListProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
  onSidebarToggle?: () => void; // Optional callback for mobile sidebar toggle
}

export function UserList({ onUserSelect, selectedUserId, onSidebarToggle }: UserListProps) {
  const { data: users, isLoading, error } = useUsers();
  const { data: aiUser, isLoading: isLoadingAI } = useAIUser();
  const { mutateAsync: createChat, isPending } = useCreateChat();
  const { data: chats } = useChats();
  const { onlineUsers, isConnected } = useSocket();
  const { user, logout } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Prefetch messages when hovering over a user
  const handleUserHover = (userId: string) => {
    if (!chats) return;

    // Find existing chat with this user
    const chat = chats.find((chat) =>
      chat.participants.some((p) => p.id === userId)
    );

    if (chat?.id) {
      // Prefetch messages for this chat
      queryClient.prefetchQuery({
        queryKey: ['messages', chat.id],
        queryFn: () => getMessages(chat.id),
        staleTime: 2 * 60 * 1000, // Same as useMessages
      });
    }
  };

  const handleUserClick = async (user: User) => {
    try {
      const chat = await createChat(user.id);
      // Find the chatId from the created chat or existing chats
      // For now, we'll just select the user and the chat page will handle finding the chat
      onUserSelect(user.id);
    } catch (error: any) {
      // If chat already exists, just select the user
      // The chat page will find the existing chat
      onUserSelect(user.id);
    }
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email[0].toUpperCase();
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  const handleAIClick = async () => {
    if (!aiUser) return;
    try {
      const chat = await createChat(aiUser.id);
      onUserSelect(aiUser.id);
    } catch (error: any) {
      // If chat already exists, just select the AI user
      onUserSelect(aiUser.id);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading || isLoadingAI) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Failed to load users
      </div>
    );
  }

  const isAISelected = aiUser && selectedUserId === aiUser.id;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-4 md:p-5 border-b border-gray-200/50 shrink-0 bg-white/80 backdrop-blur-[10px]">
        <div className="flex items-center justify-between gap-2">
          <h2
            className="text-lg md:text-xl font-bold text-[#070825] tracking-tight"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            Chat
          </h2>
          {user && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 md:h-10 md:w-10 shrink-0 text-[#070825]/70 hover:text-[#070825] hover:bg-gray-100/50 rounded-full transition-colors"
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        <div className="divide-y divide-gray-100/50">
          {/* AI Chat Option */}
          {aiUser && (
            <button
              onClick={handleAIClick}
              onMouseEnter={() => aiUser && handleUserHover(aiUser.id)}
              disabled={isPending}
              className={`w-full px-4 py-3.5 hover:bg-gray-50/80 transition-all duration-200 text-left group ${
                isAISelected ? 'bg-[#070825]/5 border-l-2 border-[#070825]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-11 w-11 bg-gradient-to-br from-purple-400 to-purple-600 ring-2 ring-white shadow-sm">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-semibold">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#070825] truncate">
                      {aiUser.name || 'AI Assistant'}
                    </p>
                  </div>
                  <p className="text-xs text-[#070825]/60 truncate mt-0.5">
                    Chat with AI
                  </p>
                </div>
              </div>
            </button>
          )}

          {/* Regular Users */}
          {users && users.length > 0 && (
            <>
              {users.map((user) => {
                const isSelected = selectedUserId === user.id;
                const isOnline = isUserOnline(user.id);

                return (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user)}
                    onMouseEnter={() => handleUserHover(user.id)}
                    disabled={isPending}
                    className={`w-full px-4 py-3.5 hover:bg-gray-50/80 transition-all duration-200 text-left group ${
                      isSelected ? 'bg-[#070825]/5 border-l-2 border-[#070825]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                          <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
                          <AvatarFallback className="bg-[#070825]/10 text-[#070825] font-semibold">
                            {getInitials(user.name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <Circle className="absolute bottom-0 right-0 h-3.5 w-3.5 fill-green-500 text-green-500 border-2 border-white rounded-full shadow-sm" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#070825] truncate">
                            {user.name || user.email}
                          </p>
                          {!isOnline && (
                            <span className="text-xs text-[#070825]/50 font-normal">offline</span>
                          )}
                        </div>
                        {user.name && (
                          <p className="text-xs text-[#070825]/60 truncate mt-0.5">
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          )}

          {(!users || users.length === 0) && !aiUser && (
            <div className="flex items-center justify-center py-12 text-sm text-[#070825]/60">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

