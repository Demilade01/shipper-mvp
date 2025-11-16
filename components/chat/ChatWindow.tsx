'use client';

import { useEffect, useRef, useState } from 'react';
import { useMessages, Message, MessagesResponse } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { useAIUser } from '@/hooks/useAIUser';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Download, File as FileIcon } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface ChatWindowProps {
  chatId: string | null;
  receiverId?: string;
  receiverName?: string;
  receiverEmail?: string;
  receiverAvatar?: string;
  onBack?: () => void; // Callback for mobile back button
}

export function ChatWindow({ chatId, receiverId, receiverName, receiverEmail, receiverAvatar, onBack }: ChatWindowProps) {
  const { data: messagesData, isLoading, error } = useMessages(chatId);
  const { user } = useAuth();
  const { socket, onlineUsers, isConnected } = useSocket();
  const { data: aiUser } = useAIUser();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [realTimeMessages, setRealTimeMessages] = useState<Message[]>([]);

  // Check if receiver is AI user
  const isAIReceiver = aiUser && receiverId === aiUser.id;

  // Check if receiver is online (only if socket is connected and not AI)
  const isReceiverOnline = !isAIReceiver && receiverId && isConnected ? onlineUsers.has(receiverId) : false;

  // Get messages from API response
  const messages = messagesData?.messages || [];

  // Combine API messages (including optimistic from cache) with real-time messages, removing duplicates
  const allMessages = (() => {
    const messageMap = new Map<string, Message>();

    // Add API messages first (includes optimistic messages from cache)
    messages.forEach((msg) => {
      messageMap.set(msg.id, msg);
    });

    // Add real-time messages (they'll overwrite API messages if duplicate, including optimistic ones)
    realTimeMessages.forEach((msg) => {
      messageMap.set(msg.id, msg);

      // If this is a real message matching an optimistic one, remove the optimistic
      if (msg._optimistic !== true) {
        // Find and remove matching optimistic message by content/timestamp
        const optimisticIds: string[] = [];
        messageMap.forEach((cachedMsg, cachedId) => {
          if (cachedMsg._optimistic) {
            const contentMatch = cachedMsg.content === msg.content ||
              (cachedMsg.attachmentUrl && cachedMsg.attachmentUrl === msg.attachmentUrl);
            const timeMatch = Math.abs(
              new Date(cachedMsg.createdAt).getTime() - new Date(msg.createdAt).getTime()
            ) < 5000; // Within 5 seconds
            if (contentMatch && timeMatch) {
              optimisticIds.push(cachedId);
            }
          }
        });
        optimisticIds.forEach(id => messageMap.delete(id));
      }
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
      attachmentUrl?: string | null;
      attachmentName?: string | null;
      attachmentType?: string | null;
      attachmentSize?: number | null;
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
          attachmentUrl: data.attachmentUrl || null,
          attachmentName: data.attachmentName || null,
          attachmentType: data.attachmentType || null,
          attachmentSize: data.attachmentSize || null,
        };

        // Remove optimistic message from cache if it matches (server confirmed)
        if (chatId) {
          queryClient.setQueryData<MessagesResponse>(['messages', chatId], (old) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.filter((cachedMsg) => {
                // Keep message if it's not optimistic
                if (!cachedMsg._optimistic) return true;

                // Remove optimistic message if it matches the real message
                const contentMatch = cachedMsg.content === message.content ||
                  (cachedMsg.attachmentUrl && cachedMsg.attachmentUrl === message.attachmentUrl);
                const timeMatch = Math.abs(
                  new Date(cachedMsg.createdAt).getTime() - new Date(message.createdAt).getTime()
                ) < 5000; // Within 5 seconds

                return !(contentMatch && timeMatch);
              }),
            };
          });
        }

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

  // Reset real-time messages when chat changes
  useEffect(() => {
    setRealTimeMessages([]);
  }, [chatId]);

  // Remove real-time messages that are now in the API messages (to avoid duplicates after refetch)
  // Optimistic messages are automatically handled by React Query cache
  useEffect(() => {
    if (messages && messages.length > 0) {
      const apiMessageIds = new Set(messages.map((m) => m.id));

      // Remove real-time messages that are now in API
      setRealTimeMessages((prev) =>
        prev.filter((msg) => !apiMessageIds.has(msg.id))
      );

      // Also clean up optimistic messages from cache that match real messages
      // This happens when API refetches after server confirms
      const optimisticInCache = messages.filter(m => m._optimistic);
      if (optimisticInCache.length > 0) {
        // Find optimistic messages that match real messages (by content/timestamp)
        const realMessages = messages.filter(m => !m._optimistic);
        const optimisticToRemove = optimisticInCache.filter((optMsg) => {
          return realMessages.some((realMsg) => {
            const contentMatch = optMsg.content === realMsg.content ||
              (optMsg.attachmentUrl && optMsg.attachmentUrl === realMsg.attachmentUrl);
            const timeMatch = Math.abs(
              new Date(optMsg.createdAt).getTime() - new Date(realMsg.createdAt).getTime()
            ) < 5000; // Within 5 seconds
            return contentMatch && timeMatch;
          });
        });

        // Remove optimistic messages from cache if they match real messages
        if (optimisticToRemove.length > 0 && chatId) {
          const optimisticIds = new Set(optimisticToRemove.map(m => m.id));
          queryClient.setQueryData<MessagesResponse>(['messages', chatId], (old) => {
            if (!old) return old;
            return {
              ...old,
              messages: old.messages.filter(msg => !optimisticIds.has(msg.id)),
            };
          });
        }
      }
    }
  }, [messages, chatId]);

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
        <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
          {/* Chat header */}
          <div className="p-4 md:p-5 border-b border-gray-200/50 bg-white/80 backdrop-blur-[10px] shrink-0">
            <div className="flex items-center gap-3">
              {/* Back button for mobile */}
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-9 w-9 shrink-0 -ml-2 text-[#070825]/70 hover:text-[#070825] hover:bg-gray-100/50 rounded-full transition-colors"
                  onClick={onBack}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <Avatar className="h-11 w-11 shrink-0 ring-2 ring-white shadow-sm">
                <AvatarImage src={receiverAvatar || undefined} alt={displayName} />
                <AvatarFallback className="bg-[#070825]/10 text-[#070825] font-semibold">
                  {getInitials(receiverName || null, receiverEmail || 'User')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#070825] truncate">{displayName}</p>
                <p className="text-xs text-[#070825]/60 mt-0.5">
                  {isAIReceiver ? 'AI Assistant' : isReceiverOnline ? 'Active now' : 'offline'}
                </p>
              </div>
            </div>
          </div>

          {/* Empty state */}
          <div className="flex-1 flex items-center justify-center min-h-0 bg-white">
            <div className="text-center text-[#070825]/60 px-4">
              <p className="text-lg font-semibold text-[#070825]">No messages yet</p>
              <p className="text-sm mt-2">Start the conversation by sending a message</p>
            </div>
          </div>
        </div>
      );
    }

    // No user selected
    return (
      <div className="flex-1 flex items-center justify-center bg-white min-h-0">
        <div className="text-center text-[#070825]/60 px-4">
          <p className="text-lg font-semibold text-[#070825]">Select a user to start chatting</p>
          <p className="text-sm mt-2">Choose a user from the list to begin a conversation</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white min-h-0">
        <Loader2 className="h-6 w-6 animate-spin text-[#070825]/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white min-h-0">
        <div className="text-center text-[#070825]/60">
          <p className="text-sm">Failed to load messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0 overflow-hidden">
      {/* Chat header */}
      <div className="p-4 md:p-5 border-b border-gray-200/50 bg-white/80 backdrop-blur-[10px] shrink-0">
        <div className="flex items-center gap-3">
          {/* Back button for mobile */}
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9 shrink-0 -ml-2 text-[#070825]/70 hover:text-[#070825] hover:bg-gray-100/50 rounded-full transition-colors"
              onClick={onBack}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-11 w-11 shrink-0 ring-2 ring-white shadow-sm">
            <AvatarImage src={receiverAvatar || undefined} alt={receiverName || receiverEmail || 'User'} />
            <AvatarFallback className="bg-[#070825]/10 text-[#070825] font-semibold">
              {getInitials(receiverName || null, receiverEmail || 'User')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#070825] truncate">{receiverName || receiverEmail || 'User'}</p>
            <p className="text-xs text-[#070825]/60 mt-0.5">
              {isAIReceiver ? 'AI Assistant' : isReceiverOnline ? 'Active now' : 'offline'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 bg-white"
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        {allMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-[#070825]/60">
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
                  <div className="w-9 shrink-0">
                    {group.shouldShowAvatar[0] && (
                      <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                        <AvatarImage src={firstMessage.sender.avatar || undefined} alt={senderName} />
                        <AvatarFallback className="bg-[#070825]/10 text-[#070825] font-semibold text-xs">
                          {getInitials(firstMessage.sender.name, firstMessage.sender.email)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>

                  {/* Messages in group */}
                  <div className={`flex flex-col gap-1 max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    {group.messages.map((message, messageIndex) => {
                      const showTimestamp = group.shouldShowTimestamp[messageIndex];

                      return (
                        <div
                          key={message.id}
                          className="flex flex-col gap-0.5"
                        >
                          {/* Attachment preview */}
                          {message.attachmentUrl && (
                            <div
                              className={`rounded-xl overflow-hidden shadow-sm ${
                                message.attachmentType?.startsWith('image/')
                                  ? 'bg-transparent' // No background for images
                                  : isOwnMessage
                                  ? 'bg-[#070825]/5 border border-[#070825]/10'
                                  : 'bg-gray-50 border border-gray-200/50'
                              }`}
                            >
                              {message.attachmentType?.startsWith('image/') ? (
                                <div className="relative">
                                  <Link
                                    href={message.attachmentUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                  >
                                    <img
                                      src={message.attachmentUrl}
                                      alt={message.attachmentName || 'Image'}
                                      className="max-w-full h-auto max-h-[500px] w-auto object-contain cursor-pointer rounded-xl block shadow-sm"
                                      loading="lazy"
                                    />
                                  </Link>
                                </div>
                              ) : (
                                <Link
                                  href={message.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-3 p-3 hover:bg-gray-100/50 transition-colors rounded-xl"
                                >
                                  <div className={`p-2 rounded-lg ${
                                    isOwnMessage
                                      ? 'bg-[#070825] text-white'
                                      : 'bg-gray-200'
                                  }`}>
                                    <FileIcon className="h-5 w-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                      isOwnMessage ? 'text-[#070825]' : 'text-[#070825]'
                                    }`}>
                                      {message.attachmentName || 'File'}
                                    </p>
                                    {message.attachmentSize && (
                                      <p className={`text-xs ${
                                        isOwnMessage ? 'text-[#070825]/70' : 'text-[#070825]/50'
                                      }`}>
                                        {(message.attachmentSize / 1024).toFixed(1)} KB
                                      </p>
                                    )}
                                  </div>
                                  <Download className={`h-4 w-4 ${
                                    isOwnMessage ? 'text-[#070825]' : 'text-[#070825]/60'
                                  }`} />
                                </Link>
                              )}
                            </div>
                          )}

                          {/* Message content - hide if it's just the attachment placeholder emoji */}
                          {message.content &&
                           !(message.attachmentUrl && message.content.trim().startsWith('📎')) && (
                            <div
                              className={`rounded-xl px-4 py-2.5 shadow-sm ${
                                isOwnMessage
                                  ? 'bg-[#070825] text-white'
                                  : 'bg-white border border-gray-200/50 text-[#070825]'
                              }`}
                              style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}
                            >
                              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            </div>
                          )}

                          {showTimestamp && (
                            <p className="text-xs text-[#070825]/50 px-1.5 mt-0.5">
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

