'use client';

import { useUsers } from '@/hooks/useUsers';
import { useAIUser } from '@/hooks/useAIUser';
import { useCreateChat } from '@/hooks/useChats';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Circle, Bot } from 'lucide-react';
import { User } from '@/hooks/useUsers';

interface UserListProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
}

export function UserList({ onUserSelect, selectedUserId }: UserListProps) {
  const { data: users, isLoading, error } = useUsers();
  const { data: aiUser, isLoading: isLoadingAI } = useAIUser();
  const { mutateAsync: createChat, isPending } = useCreateChat();
  const { onlineUsers, isConnected } = useSocket();

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
      <div className="p-4 border-b shrink-0">
        <h2 className="text-lg font-semibold">Users</h2>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="divide-y">
          {/* AI Chat Option */}
          {aiUser && (
            <button
              onClick={handleAIClick}
              disabled={isPending}
              className={`w-full px-4 py-3 hover:bg-[#f8fafb] transition-colors text-left ${
                isAISelected ? 'bg-[#f8fafb]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10 bg-purple-100">
                    <AvatarFallback className="bg-purple-500 text-white">
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {aiUser.name || 'AI Assistant'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
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
                    disabled={isPending}
                    className={`w-full px-4 py-3 hover:bg-[#f8fafb] transition-colors text-left ${
                      isSelected ? 'bg-[#f8fafb]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar || undefined} alt={user.name || user.email} />
                          <AvatarFallback>
                            {getInitials(user.name, user.email)}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {user.name || user.email}
                          </p>
                          {!isOnline && (
                            <span className="text-xs text-muted-foreground">offline</span>
                          )}
                        </div>
                        {user.name && (
                          <p className="text-xs text-muted-foreground truncate">
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
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No users found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

