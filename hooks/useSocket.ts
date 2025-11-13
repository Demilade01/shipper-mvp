'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './useAuth';

// Socket.io event types
export interface ServerToClientEvents {
  message: (data: {
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
  }) => void;
  userOnline: (userId: string) => void;
  userOffline: (userId: string) => void;
  onlineUsers: (userIds: string[]) => void; // Initial list of online users
  typing: (data: { userId: string; chatId: string; isTyping: boolean }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (data: {
    content: string;
    chatId: string;
    receiverId?: string;
  }) => void;
  typing: (data: { chatId: string; isTyping: boolean }) => void;
}

/**
 * Custom hook for Socket.io connection
 */
export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Function to get socket token from cookies
    const getSocketToken = () => {
      const cookies = document.cookie.split(';');
      // Try socket_token first (non-HttpOnly cookie for Socket.io)
      const socketTokenCookie = cookies.find(cookie => cookie.trim().startsWith('socket_token='));
      if (socketTokenCookie) {
        const token = socketTokenCookie.split('=')[1]?.trim();
        if (token) {
          return token;
        }
      }
      return null;
    };

    // Function to fetch socket token from API
    const fetchSocketToken = async () => {
      try {
        const response = await fetch('/api/auth/socket-token', {
          method: 'GET',
          credentials: 'include', // Important: include cookies
        });

        if (!response.ok) {
          return null;
        }

        // Cookie should now be set, try to get it again
        return getSocketToken();
      } catch (error) {
        return null;
      }
    };

    // Initialize socket connection
    const initializeSocket = async () => {
      // First, try to get token from cookies
      let token = getSocketToken();

      // If not found, fetch it from API
      if (!token) {
        token = await fetchSocketToken();
      }

      if (!token) {
        return null;
      }

      // Initialize Socket.io client
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';
      const newSocket = io(socketUrl, {
        path: '/api/socket',
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'],
      });

      // Connection events
      newSocket.on('connect', () => {
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        setOnlineUsers(new Set()); // Clear online users on disconnect
      });

      newSocket.on('connect_error', () => {
        setIsConnected(false);
      });

      // Initial list of online users (sent when client connects)
      newSocket.on('onlineUsers', (userIds: string[]) => {
        setOnlineUsers(new Set(userIds));
      });

      // User online/offline events
      newSocket.on('userOnline', (userId) => {
        setOnlineUsers((prev) => new Set(prev).add(userId));
      });

      newSocket.on('userOffline', (userId) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      // Error events
      newSocket.on('error', () => {
        // Handle error silently
      });

      setSocket(newSocket);
      socketRef.current = newSocket; // Store in ref for cleanup

      // Return cleanup function
      const cleanup = () => {
        newSocket.close();
        setSocket(null);
        socketRef.current = null;
        setIsConnected(false);
        setOnlineUsers(new Set());
      };

      cleanupRef.current = cleanup; // Store cleanup in ref
      return cleanup;
    };

    // Initialize socket
    initializeSocket().catch(() => {
      // Handle error silently
    });

    // Cleanup on unmount
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      } else if (socketRef.current) {
        socketRef.current.close();
        setSocket(null);
        socketRef.current = null;
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
    };
  }, [isAuthenticated, user]);

  return {
    socket,
    isConnected,
    onlineUsers,
  };
}

