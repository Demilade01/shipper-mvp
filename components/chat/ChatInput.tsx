'use client';

import { useState, useRef, useEffect } from 'react';
import { useCreateMessage } from '@/hooks/useMessages';
import { useCreateChat } from '@/hooks/useChats';
import { useSocket } from '@/hooks/useSocket';
import { useAIUser } from '@/hooks/useAIUser';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Paperclip, X, Image as ImageIcon, File } from 'lucide-react';

interface ChatInputProps {
  chatId: string | null;
  receiverId?: string;
  onChatCreated?: (chatId: string) => void;
}

interface FileAttachment {
  file: File;
  url?: string;
  name: string;
  type: string;
  size: number;
}

export function ChatInput({ chatId, receiverId, onChatCreated }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState<FileAttachment | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { mutateAsync: createMessage, isPending: isSending } = useCreateMessage();
  const { mutateAsync: createChat, isPending: isCreatingChat } = useCreateChat();
  const { socket } = useSocket();
  const { data: aiUser } = useAIUser();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId);
  const [isAILoading, setIsAILoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Update currentChatId when chatId prop changes
  useEffect(() => {
    setCurrentChatId(chatId);
  }, [chatId]);

  const isPending = isSending || isCreatingChat || isAILoading || isUploading;
  const isAIChat = aiUser && receiverId === aiUser.id;

  // Handle file selection
  const handleFileSelect = (file: File) => {
    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size exceeds maximum of ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Validate file type (check MIME type and extension as fallback)
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
    ];

    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'];

    // Check if file type is allowed OR if extension is allowed (for files without MIME type)
    const isTypeAllowed = allowedTypes.includes(file.type) || (fileExtension && allowedExtensions.includes(fileExtension));

    if (!isTypeAllowed) {
      alert(`File type not allowed. Allowed types: images (jpg, png, gif, webp), PDF, Word, Excel, text files. Your file: ${file.name} (type: ${file.type || 'unknown'})`);
      return;
    }

    // Create preview URL for images
    let previewUrl: string | undefined;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    setAttachment({
      file,
      url: previewUrl,
      name: file.name,
      type: file.type,
      size: file.size,
    });
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Remove attachment
  const handleRemoveAttachment = () => {
    // Revoke object URL to free memory
    if (attachment?.url && attachment.url.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachment(null);
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (attachment?.url && attachment.url.startsWith('blob:')) {
        URL.revokeObjectURL(attachment.url);
      }
    };
  }, [attachment]);

  // Upload file to server
  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include', // Important: include cookies for authentication
    });

    if (!response.ok) {
      let error;
      try {
        error = await response.json();
      } catch {
        error = { error: `Upload failed with status ${response.status}: ${response.statusText}` };
      }
      const errorMessage = error.error || `Upload failed with status ${response.status}`;
      console.error('Upload API error:', {
        status: response.status,
        statusText: response.statusText,
        error: error,
        file: { name: file.name, type: file.type, size: file.size }
      });
      throw new Error(errorMessage);
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !attachment) || !receiverId || isPending) return;

    const messageContent = message.trim() || (attachment ? `📎 ${attachment.name}` : '');
    const currentAttachment = attachment;

    // Clear input and attachment
    setMessage('');
    setAttachment(null);

    try {
      // Upload file if attachment exists
      let attachmentData: { url: string; name: string; type: string; size: number } | null = null;
      if (currentAttachment) {
        setIsUploading(true);
        try {
          attachmentData = await uploadFile(currentAttachment.file);
        } catch (error: any) {
          console.error('Error uploading file:', error);
          // Restore message and attachment on error
          setMessage(messageContent);
          setAttachment(currentAttachment);
          setIsUploading(false);
          // Show more detailed error message
          const errorMessage = error?.message || 'Failed to upload file. Please try again.';
          alert(errorMessage);
          return;
        }
        setIsUploading(false);
      }

      // Handle AI chat differently (AI doesn't support attachments for now)
      if (isAIChat) {
        if (attachmentData) {
          alert('File attachments are not supported in AI chat');
          // Restore message and attachment
          setMessage(messageContent);
          setAttachment(currentAttachment);
          return;
        }

        setIsAILoading(true);

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

        // Send message to AI API
        const response = await fetch('/api/chat/ai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageContent,
            chatId: actualChatId,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          const errorMessage = error.error || error.message || 'Failed to send message to AI';
          throw new Error(errorMessage);
        }

        // Invalidate messages query to refetch with AI response
        queryClient.invalidateQueries({ queryKey: ['messages', actualChatId] });
        queryClient.invalidateQueries({ queryKey: ['chats'] });

        // Emit message event via Socket.io if connected for real-time update
        if (socket && socket.connected) {
          socket.emit('joinChat', actualChatId);
        }

        setIsAILoading(false);
        return;
      }

      // Regular chat handling
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

      // Prepare message data with attachment
      // Use empty string if no content but attachment exists (backend will add emoji)
      const messageData = {
        content: messageContent || '',
        chatId: actualChatId,
        receiverId,
        ...(attachmentData && {
          attachmentUrl: attachmentData.url,
          attachmentName: attachmentData.name,
          attachmentType: attachmentData.type,
          attachmentSize: attachmentData.size,
        }),
      };

      // Prefer Socket.io for real-time messaging (saves to DB and broadcasts)
      // Fallback to API if Socket.io is not connected
      if (socket && socket.connected) {
        // Send via Socket.io (server will save to DB and broadcast)
        socket.emit('sendMessage', messageData);
      } else {
        // Fallback to API if Socket.io is not connected
        await createMessage(messageData);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message and attachment on error
      setMessage(messageContent);
      if (currentAttachment) {
        setAttachment(currentAttachment);
      }
      setIsAILoading(false);
      setIsUploading(false);
      // TODO: Show error toast/notification to user
      // For now, error is logged to console
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

  // Check if message or attachment exists
  const canSend = message.trim() || attachment;

  // Check if attachment is an image
  const isImage = attachment?.type.startsWith('image/');

  return (
    <div
      className={`p-3 md:p-4 border-t bg-white shrink-0 safe-area-pb ${isDragging ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Attachment preview */}
      {attachment && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg border flex items-center gap-2">
          {isImage && attachment.url ? (
            <img
              src={attachment.url}
              alt={attachment.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
              <File className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{attachment.name}</p>
            <p className="text-xs text-muted-foreground">
              {(attachment.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleRemoveAttachment}
            disabled={isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInputChange}
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          disabled={!!(isPending || isAIChat)}
        />

        {/* File picker button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={() => fileInputRef.current?.click()}
          disabled={!!(isPending || isAIChat)}
          title="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Input
          ref={inputRef}
          type="text"
          placeholder={isAIChat ? "Ask AI anything..." : attachment ? "Add a caption (optional)..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isPending}
          className="flex-1 text-base md:text-sm"
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="true"
        />
        <Button
          type="submit"
          disabled={!canSend || isPending}
          className="shrink-0 h-10 w-10 md:h-auto md:w-auto p-0 md:px-4"
          size="icon"
        >
          {isAILoading || isUploading ? (
            <Loader2 className="h-5 w-5 md:h-4 md:w-4 animate-spin" />
          ) : (
            <Send className="h-5 w-5 md:h-4 md:w-4" />
          )}
        </Button>
      </form>
      {isAILoading && (
        <p className="text-xs text-muted-foreground mt-2">
          AI is thinking...
        </p>
      )}
      {isUploading && (
        <p className="text-xs text-muted-foreground mt-2">
          Uploading file...
        </p>
      )}
      {isDragging && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Drop file here to attach
        </p>
      )}
    </div>
  );
}

