const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { withAccelerate } = require('@prisma/extension-accelerate');

// Load environment variables
require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// JWT Secret
const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_SECRET || 'your-access-secret-change-in-production';

// Create Prisma Client
const prismaClient = new PrismaClient({
  log: dev ? ['error', 'warn'] : ['error'],
}).$extends(withAccelerate());

const db = prismaClient;

// Create Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

/**
 * Verify an access token
 */
function verifyAccessToken(token) {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
    if (decoded.type !== 'access') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

// Store online users: userId -> Set of socketIds (one user can have multiple connections)
const onlineUsers = new Map();
const socketToUser = new Map();

/**
 * Add user to online users
 */
function addOnlineUser(userId, socketId, ioInstance) {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }

  onlineUsers.get(userId).add(socketId);
  socketToUser.set(socketId, userId);

  // If this is the first connection for this user, notify others
  if (onlineUsers.get(userId).size === 1) {
    ioInstance.emit('userOnline', userId);
  }
}

/**
 * Remove user from online users
 */
function removeOnlineUser(socketId, ioInstance) {
  const userId = socketToUser.get(socketId);

  if (!userId) {
    return;
  }

  const userSockets = onlineUsers.get(userId);
  if (userSockets) {
    userSockets.delete(socketId);

    // If this was the last connection for this user, notify others
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
      ioInstance.emit('userOffline', userId);
    }
  }

  socketToUser.delete(socketId);
}

app.prepare().then(() => {
  // Create HTTP server
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create Socket.io server attached to HTTP server
  const io = new Server(httpServer, {
    path: '/api/socket',
    cors: {
      origin: dev ? 'http://localhost:3000' : process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token
      const payload = verifyAccessToken(token);
      if (!payload) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Get user from database to ensure user exists
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
        },
      });

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user data to socket
      socket.data.userId = user.id;
      socket.data.user = user;

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    const userId = socket.data.userId;
    const user = socket.data.user;

    // Add user to online users first (this will emit userOnline to all other clients)
    addOnlineUser(userId, socket.id, io);

    // Send new client list of currently online users (excluding themselves)
    // Always send the list, even if empty, so the client initializes properly
    const currentlyOnlineUsers = Array.from(onlineUsers.keys()).filter(id => id !== userId);
    socket.emit('onlineUsers', currentlyOnlineUsers);

    // Join chat room handler
    socket.on('joinChat', async (chatId) => {
      try {
        // Verify user is a participant in the chat
        const participant = await db.chatParticipant.findFirst({
          where: {
            userId: userId,
            chatId: chatId,
          },
        });

        if (!participant) {
          socket.emit('error', { message: 'Not a participant in this chat' });
          return;
        }

        // Join the chat room
        socket.join(`chat:${chatId}`);
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave chat room handler
    socket.on('leaveChat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    // Send message handler
    socket.on('sendMessage', async (data) => {
      try {
        const { content, chatId, receiverId } = data;

        // Verify user is a participant in the chat
        const participant = await db.chatParticipant.findFirst({
          where: {
            userId: userId,
            chatId: chatId,
          },
        });

        if (!participant) {
          socket.emit('error', { message: 'Not a participant in this chat' });
          return;
        }

        // Create message in database
        const message = await db.message.create({
          data: {
            content,
            senderId: userId,
            receiverId: receiverId || null,
            chatId,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
            receiver: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
        });

        // Update chat's updatedAt
        await db.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() },
        });

        // Broadcast message to all participants in the chat room
        io.to(`chat:${chatId}`).emit('message', {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          chatId: message.chatId,
          createdAt: message.createdAt.toISOString(),
          sender: message.sender,
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator handler
    socket.on('typing', (data) => {
      const { chatId, isTyping } = data;

      // Broadcast typing indicator to all other participants in the chat
      socket.to(`chat:${chatId}`).emit('typing', {
        userId: userId,
        chatId: chatId,
        isTyping: isTyping,
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      // Leave all chat rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room.startsWith('chat:')) {
          socket.leave(room);
        }
      });

      // Remove user from online users
      removeOnlineUser(socket.id, io);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Start server
  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`🚀 Socket.io server running on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    httpServer.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
});

