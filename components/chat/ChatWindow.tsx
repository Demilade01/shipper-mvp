'use client';

import { useEffect, useRef, useState } from 'react';
import { useMessages, Message } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  chatId: string | null;
  receiverId?: string;
  receiverName?: string;
  receiverEmail?: string;
  receiverAvatar?: string;
}

export function ChatWindow({ chatId, receiverId, receiverName, receiverEmail, receiverAvatar }: ChatWindowProps) {
  const { data: messages, isLoading, error } = useMessages(chatId);
  const { user } = useAuth();
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [realTimeMessages, setRealTimeMessages] = useState<Message[]>([]);

  // Combine API messages with real-time messages, removing duplicates
  const allMessages = (() => {
    const messageMap = new Map<string, Message>();

    // Add API messages first
    if (messages) {
      messages.forEach((msg) => {
        messageMap.set(msg.id, msg);
      });
    }

    // Add real-time messages (they'll overwrite API messages if duplicate)
    realTimeMessages.forEach((msg) => {
      messageMap.set(msg.id, msg);
    });

    // Convert map to array and sort by timestamp
    return Array.from(messageMap.values()).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  })();

  // Listen for real-time messages
  useEffect(() => {
    if (!socket || !chatId) return;

    // Join chat room
    socket.emit('joinChat', chatId);

    // Listen for new messages
    const handleMessage = (data: {
      id: string;
      content: string;
      senderId: string;
      receiverId?: string;
      chatId?: string;
      createdAt: string;
      sender: {
        id: string;
        email: string;
        name: string | null;
        avatar: string | null;
      };
    }) => {
      if (data.chatId === chatId) {
        // Transform Socket.io message to Match Message type
        const message: Message = {
          id: data.id,
          content: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId || null,
          chatId: data.chatId || null,
          createdAt: data.createdAt,
          sender: data.sender,
          receiver: null, // Receiver is not included in Socket.io events
        };

        setRealTimeMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      }
    };

    socket.on('message', handleMessage);

    return () => {
      socket.off('message', handleMessage);
      if (chatId) {
        socket.emit('leaveChat', chatId);
      }
    };
  }, [socket, chatId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  // Reset real-time messages when chat changes or messages are refetched
  useEffect(() => {
    setRealTimeMessages([]);
  }, [chatId]);

  // Remove real-time messages that are now in the API messages (to avoid duplicates after refetch)
  useEffect(() => {
    if (messages && messages.length > 0) {
      setRealTimeMessages((prev) => {
        const apiMessageIds = new Set(messages.map((m) => m.id));
        return prev.filter((msg) => !apiMessageIds.has(msg.id));
      });
    }
  }, [messages]);

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

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return format(date, 'HH:mm');
      } else if (diffInHours < 48) {
        return 'Yesterday';
      } else {
        return format(date, 'MMM d');
      }
    } catch {
      return '';
    }
  };

  if (!chatId) {
    if (receiverId && (receiverName || receiverEmail)) {
      // User is selected but chat doesn't exist yet - show receiver info
      const displayName = receiverName || receiverEmail || 'User';
      return (
        <div className="flex-1 flex flex-col bg-[#f9f9f9]">
          {/* Chat header */}
          <div className="p-4 border-b bg-white">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={receiverAvatar || undefined} alt={displayName} />
                <AvatarFallback>
                  {getInitials(receiverName || null, receiverEmail || 'User')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{displayName}</p>
                <p className="text-xs text-muted-foreground">Start a conversation</p>
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg font-medium">No messages yet</p>
              <p className="text-sm mt-2">Start the conversation by sending a message</p>
            </div>
          </div>
        </div>
      );
    }

    // No user selected
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f9]">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Select a user to start chatting</p>
          <p className="text-sm mt-2">Choose a user from the list to begin a conversation</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f9]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f9]">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Failed to load messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9f9]">
      {/* Chat header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={receiverAvatar || undefined} alt={receiverName || receiverEmail || 'User'} />
            <AvatarFallback>
              {getInitials(receiverName || null, receiverEmail || 'User')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{receiverName || receiverEmail || 'User'}</p>
            <p className="text-xs text-muted-foreground">Active now</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          allMessages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            const senderName = message.sender.name || message.sender.email;

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={message.sender.avatar || undefined} alt={senderName} />
                  <AvatarFallback>
                    {getInitials(message.sender.name, message.sender.email)}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwnMessage
                        ? 'bg-[#1e3a8a] text-white'
                        : 'bg-white border'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground px-1">
                    {formatMessageTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

