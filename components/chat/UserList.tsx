'use client';

import { useUsers } from '@/hooks/useUsers';
import { useCreateChat } from '@/hooks/useChats';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, Circle } from 'lucide-react';
import { User } from '@/hooks/useUsers';

interface UserListProps {
  onUserSelect: (userId: string) => void;
  selectedUserId?: string;
}

export function UserList({ onUserSelect, selectedUserId }: UserListProps) {
  const { data: users, isLoading, error } = useUsers();
  const { mutateAsync: createChat, isPending } = useCreateChat();
  const { onlineUsers } = useSocket();

  const handleUserClick = async (user: User) => {
    try {
      const chat = await createChat(user.id);
      // Find the chatId from the created chat or existing chats
      // For now, we'll just select the user and the chat page will handle finding the chat
      onUserSelect(user.id);
    } catch (error: any) {
      console.error('Error creating chat:', error);
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

  if (isLoading) {
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

  if (!users || users.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        No users found
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Users</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y">
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
        </div>
      </div>
    </div>
  );
}

