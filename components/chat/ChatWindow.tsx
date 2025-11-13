'use client';

import { useEffect, useRef, useState } from 'react';
import { useMessages, Message } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useAIUser } from '@/hooks/useAIUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

interface ChatWindowProps {
  chatId: string | null;
  receiverId?: string;
  receiverName?: string;
  receiverEmail?: string;
  receiverAvatar?: string;
  onBack?: () => void; // Callback for mobile back button
}

export function ChatWindow({ chatId, receiverId, receiverName, receiverEmail, receiverAvatar, onBack }: ChatWindowProps) {
  const { data: messages, isLoading, error } = useMessages(chatId);
  const { user } = useAuth();
  const { socket, onlineUsers, isConnected } = useSocket();
  const { data: aiUser } = useAIUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [realTimeMessages, setRealTimeMessages] = useState<Message[]>([]);

  // Check if receiver is AI user
  const isAIReceiver = aiUser && receiverId === aiUser.id;

  // Check if receiver is online (only if socket is connected and not AI)
  const isReceiverOnline = !isAIReceiver && receiverId && isConnected ? onlineUsers.has(receiverId) : false;

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

  // Group messages: determine which messages should be grouped together
  // Messages are grouped if they're from the same sender and within 5 minutes of each other
  const GROUP_TIME_THRESHOLD = 5 * 60 * 1000; // 5 minutes in milliseconds

  const messageGroups = (() => {
    if (allMessages.length === 0) return [];

    const groups: Array<{
      messages: Message[];
      shouldShowAvatar: boolean[];
      shouldShowTimestamp: boolean[];
    }> = [];

    for (let i = 0; i < allMessages.length; i++) {
      const currentMessage = allMessages[i];
      const previousMessage = i > 0 ? allMessages[i - 1] : null;

      // Check if this message should be grouped with the previous one
      const shouldGroup =
        previousMessage &&
        previousMessage.senderId === currentMessage.senderId &&
        new Date(currentMessage.createdAt).getTime() - new Date(previousMessage.createdAt).getTime() <= GROUP_TIME_THRESHOLD;

      if (shouldGroup && groups.length > 0) {
        // Add to last group
        const lastGroup = groups[groups.length - 1];
        lastGroup.messages.push(currentMessage);
        lastGroup.shouldShowAvatar.push(false); // Don't show avatar for grouped messages
        lastGroup.shouldShowTimestamp.push(true); // Will be updated later
      } else {
        // Create new group
        groups.push({
          messages: [currentMessage],
          shouldShowAvatar: [true], // Show avatar for first message in group
          shouldShowTimestamp: [true], // Will be updated later
        });
      }
    }

    // Update timestamp visibility: show timestamp on last message of each group
    groups.forEach((group) => {
      // Reset all to false first
      group.shouldShowTimestamp.fill(false);
      // Show timestamp on last message
      if (group.messages.length > 0) {
        group.shouldShowTimestamp[group.messages.length - 1] = true;
      }
    });

    return groups;
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
    if (messagesContainerRef.current && messagesEndRef.current) {
      // Only scroll if user is near the bottom (within 100px)
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      if (isNearBottom || allMessages.length <= 1) {
        // Small delay to ensure DOM is updated after grouping
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 0);
      }
    }
  }, [allMessages.length]); // Use length instead of array to avoid dependency array size changes

  // Scroll to bottom on initial load
  useEffect(() => {
    if (messages && messages.length > 0 && messagesContainerRef.current) {
      // Scroll to bottom immediately on load
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, chatId]);

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
        <div className="flex-1 flex flex-col bg-[#f9f9f9] min-h-0 overflow-hidden">
          {/* Chat header */}
          <div className="p-3 md:p-4 border-b bg-white shrink-0">
            <div className="flex items-center gap-3">
              {/* Back button for mobile */}
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-8 w-8 shrink-0 -ml-2"
                  onClick={onBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={receiverAvatar || undefined} alt={displayName} />
                <AvatarFallback>
                  {getInitials(receiverName || null, receiverEmail || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {isAIReceiver ? 'AI Assistant' : isReceiverOnline ? 'Active now' : 'offline'}
                </p>
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex-1 flex items-center justify-center min-h-0">
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
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f9] min-h-0">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">Select a user to start chatting</p>
          <p className="text-sm mt-2">Choose a user from the list to begin a conversation</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f9] min-h-0">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#f9f9f9] min-h-0">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">Failed to load messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f9f9f9] min-h-0 overflow-hidden">
      {/* Chat header */}
      <div className="p-3 md:p-4 border-b bg-white shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-8 w-8 shrink-0 -ml-2"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={receiverAvatar || undefined} alt={receiverName || receiverEmail || 'User'} />
            <AvatarFallback>
              {getInitials(receiverName || null, receiverEmail || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{receiverName || receiverEmail || 'User'}</p>
            <p className="text-xs text-muted-foreground">
              {isAIReceiver ? 'AI Assistant' : isReceiverOnline ? 'Active now' : 'offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 min-h-0"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messageGroups.map((group, groupIndex) => {
              const firstMessage = group.messages[0];
              const isOwnMessage = firstMessage.senderId === user?.id;
              const senderName = firstMessage.sender.name || firstMessage.sender.email;

              return (
                <div
                  key={`group-${groupIndex}-${firstMessage.id}`}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''} ${
                    groupIndex > 0 ? 'mt-4' : ''
                  }`}
                >
                  {/* Avatar - only show for first message in group */}
                  <div className="w-8 shrink-0">
                    {group.shouldShowAvatar[0] && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={firstMessage.sender.avatar || undefined} alt={senderName} />
                        <AvatarFallback>
                          {getInitials(firstMessage.sender.name, firstMessage.sender.email)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Messages in group */}
                  <div className={`flex flex-col gap-0.5 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {group.messages.map((message, messageIndex) => {
                      const showTimestamp = group.shouldShowTimestamp[messageIndex];

                      return (
                        <div
                          key={message.id}
                          className="flex flex-col gap-0.5"
                        >
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-[#1e3a8a] text-white'
                                : 'bg-white border'
                            }`}
                            style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          {showTimestamp && (
                            <p className="text-xs text-muted-foreground px-1">
                              {formatMessageTime(message.createdAt)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}

