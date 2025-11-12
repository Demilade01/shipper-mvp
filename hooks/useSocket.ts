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

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    // Get access token from cookie
    const getAccessToken = () => {
      const cookies = document.cookie.split(';');
      const accessTokenCookie = cookies.find(cookie => cookie.trim().startsWith('access_token='));
      return accessTokenCookie ? accessTokenCookie.split('=')[1] : null;
    };

    const token = getAccessToken();
    if (!token) {
      return;
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
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
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
    newSocket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  return {
    socket,
    isConnected,
    onlineUsers,
  };
}

