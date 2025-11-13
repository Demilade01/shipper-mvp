'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useAIUser } from '@/hooks/useAIUser';
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
  const { data: aiUser } = useAIUser();
  const { data: chats, refetch: refetchChats } = useChats();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [showSidebar, setShowSidebar] = useState(true); // Mobile sidebar state

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

  // Handle user selection (hide sidebar on mobile)
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
    // Hide sidebar on mobile when user is selected
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebar(false);
    }
  };

  // Handle back button (show sidebar on mobile)
  const handleBackToUsers = () => {
    setSelectedUserId(null);
    setCurrentChat(null);
    // Show sidebar on mobile when going back
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setShowSidebar(true);
    }
  };

  // Handle sidebar toggle for mobile
  const handleSidebarToggle = () => {
    setShowSidebar((prev) => !prev);
  };

  // Reset sidebar state on window resize and based on selection
  useEffect(() => {
    const handleResize = () => {
      // On desktop (md and above), always show sidebar
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      } else {
        // On mobile, hide sidebar if user is selected, show if no user selected
        setShowSidebar(!selectedUserId);
      }
    };

    // Set initial state based on screen size and selection
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      } else {
        setShowSidebar(!selectedUserId);
      }
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [selectedUserId]);

  // Handle chat creation from ChatInput
  const handleChatCreated = async (chatId: string) => {
    // Refetch chats to get the new chat
    await refetchChats();
    // Find and set the new chat
    queryClient.invalidateQueries({ queryKey: ['chats'] });
    // The useEffect will update currentChat when chats are refetched
  };

  // Get receiver info (check both users and AI user)
  const receiver = users?.find((u) => u.id === selectedUserId) || (aiUser && aiUser.id === selectedUserId ? aiUser : null);
  const receiverId = receiver?.id;
  const receiverName = receiver?.name || undefined;
  const receiverEmail = receiver?.email;
  const receiverAvatar = receiver?.avatar || undefined;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#070825]/60" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-white relative">
      {/* User list sidebar */}
      <div
        className={`
          absolute md:relative
          inset-0 md:inset-auto
          w-full md:w-80
          border-r border-gray-200/50 bg-white/95 backdrop-blur-[10px] flex flex-col overflow-hidden
          z-50 md:z-auto
          transition-transform duration-300 ease-in-out shadow-lg md:shadow-none
          ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <UserList
          onUserSelect={handleUserSelect}
          selectedUserId={selectedUserId || undefined}
          onSidebarToggle={handleSidebarToggle}
        />
      </div>

      {/* Chat window */}
      <div
        className={`
          absolute md:relative inset-0 md:inset-auto
          flex-1 flex flex-col overflow-hidden min-w-0 bg-white
          ${selectedUserId ? 'flex' : 'hidden md:flex'}
          z-30 md:z-auto
        `}
      >
        <ChatWindow
          chatId={currentChat?.id || null}
          receiverId={receiverId}
          receiverName={receiverName}
          receiverEmail={receiverEmail}
          receiverAvatar={receiverAvatar}
          onBack={handleBackToUsers}
        />
        <ChatInput
          chatId={currentChat?.id || null}
          receiverId={receiverId}
          onChatCreated={handleChatCreated}
        />
      </div>

      {/* Overlay for mobile when sidebar is open and no user selected */}
      {showSidebar && !selectedUserId && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={handleSidebarToggle}
        />
      )}
    </div>
  );
}

