/**
 * WebSocket Service - Production-ready real-time communication
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { GroupMember as StudyGroupMember, GroupMessage as StudyGroupMessage } from '../models/StudyGroup';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'question' | 'resource' | 'announcement' | 'poll' | 'system';
  metadata?: any;
  timestamp: string;
}

interface TypingUser {
  userId: string;
  name: string;
  groupId: string;
}

interface OnlineUser {
  userId: string;
  name: string;
  socketId: string;
  joinedAt: Date;
}

class WebSocketService {
  private io: Server | null = null;
  private onlineUsers: Map<string, OnlineUser> = new Map(); // userId -> OnlineUser
  private groupRooms: Map<string, Set<string>> = new Map(); // groupId -> Set<socketId>
  private typingUsers: Map<string, Map<string, TypingUser>> = new Map(); // groupId -> Map<userId, TypingUser>
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startHeartbeat();

    console.log('🔌 WebSocket server initialized');
    return this.io;
  }

  /**
   * Authentication middleware
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { userId: string };
        const user = await User.findByPk(decoded.userId, {
          attributes: ['id', 'fullName', 'email']
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        const nameParts = (user.fullName || '').split(' ');
        socket.user = {
          id: user.id,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email
        };

        next();
      } catch (error) {
        console.error('WebSocket auth error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.user?.firstName} (${socket.userId})`);
      
      // Track online user
      if (socket.userId && socket.user) {
        this.onlineUsers.set(socket.userId, {
          userId: socket.userId,
          name: `${socket.user.firstName} ${socket.user.lastName}`,
          socketId: socket.id,
          joinedAt: new Date()
        });
      }

      // Join group chat room
      socket.on('join_group', async (groupId: string) => {
        await this.handleJoinGroup(socket, groupId);
      });

      // Leave group chat room
      socket.on('leave_group', (groupId: string) => {
        this.handleLeaveGroup(socket, groupId);
      });

      // Send message
      socket.on('send_message', async (data: {
        groupId: string;
        content: string;
        type?: string;
        metadata?: any;
      }) => {
        await this.handleSendMessage(socket, data);
      });

      // Typing indicator
      socket.on('typing_start', (groupId: string) => {
        this.handleTypingStart(socket, groupId);
      });

      socket.on('typing_stop', (groupId: string) => {
        this.handleTypingStop(socket, groupId);
      });

      // Get online users in group
      socket.on('get_online_users', (groupId: string) => {
        const users = this.getOnlineUsersInGroup(groupId);
        socket.emit('online_users', { groupId, users });
      });

      // Disconnect
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });

      // Error handling
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
    });
  }

  /**
   * Handle user joining a group
   */
  private async handleJoinGroup(socket: AuthenticatedSocket, groupId: string): Promise<void> {
    if (!socket.userId) return;

    try {
      // Verify membership
      const member = await StudyGroupMember.findOne({
        where: { groupId, userId: socket.userId, status: 'active' }
      });

      if (!member) {
        socket.emit('error', { message: 'Not a member of this group' });
        return;
      }

      // Join room
      socket.join(`group:${groupId}`);

      // Track room membership
      if (!this.groupRooms.has(groupId)) {
        this.groupRooms.set(groupId, new Set());
      }
      this.groupRooms.get(groupId)!.add(socket.id);

      // Update member last active
      await member.update({ lastActiveAt: new Date() });

      // Notify others
      socket.to(`group:${groupId}`).emit('user_joined', {
        userId: socket.userId,
        userName: `${socket.user?.firstName} ${socket.user?.lastName}`,
        groupId
      });

      // Send online users list
      const onlineUsers = this.getOnlineUsersInGroup(groupId);
      socket.emit('online_users', { groupId, users: onlineUsers });

      console.log(`User ${socket.user?.firstName} joined group ${groupId}`);
    } catch (error) {
      console.error('Join group error:', error);
      socket.emit('error', { message: 'Failed to join group' });
    }
  }

  /**
   * Handle user leaving a group
   */
  private handleLeaveGroup(socket: AuthenticatedSocket, groupId: string): void {
    socket.leave(`group:${groupId}`);

    const room = this.groupRooms.get(groupId);
    if (room) {
      room.delete(socket.id);
      if (room.size === 0) {
        this.groupRooms.delete(groupId);
      }
    }

    // Clear typing status
    this.handleTypingStop(socket, groupId);

    // Notify others
    socket.to(`group:${groupId}`).emit('user_left', {
      userId: socket.userId,
      userName: `${socket.user?.firstName} ${socket.user?.lastName}`,
      groupId
    });
  }

  /**
   * Handle sending a message
   */
  private async handleSendMessage(
    socket: AuthenticatedSocket,
    data: { groupId: string; content: string; type?: string; metadata?: any }
  ): Promise<void> {
    if (!socket.userId || !socket.user) return;

    try {
      // Verify membership
      const member = await StudyGroupMember.findOne({
        where: { groupId: data.groupId, userId: socket.userId, status: 'active' }
      });

      if (!member) {
        socket.emit('error', { message: 'Not authorized to send messages' });
        return;
      }

      // Save message to database
      const message = await StudyGroupMessage.create({
        groupId: data.groupId,
        senderId: socket.userId,
        content: data.content,
        type: data.type || 'text',
        metadata: data.metadata
      });

      // Update member contribution
      await member.increment('contributionPoints', { by: 1 });
      await member.update({ lastActiveAt: new Date() });

      // Prepare message for broadcast
      const chatMessage: ChatMessage = {
        id: message.id,
        groupId: data.groupId,
        senderId: socket.userId,
        senderName: `${socket.user.firstName} ${socket.user.lastName}`,
        content: data.content,
        type: (data.type as ChatMessage['type']) || 'text',
        metadata: data.metadata,
        timestamp: message.createdAt.toISOString()
      };

      // Broadcast to group
      this.io?.to(`group:${data.groupId}`).emit('new_message', chatMessage);

      // Clear typing status
      this.handleTypingStop(socket, data.groupId);

    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  /**
   * Handle typing start
   */
  private handleTypingStart(socket: AuthenticatedSocket, groupId: string): void {
    if (!socket.userId || !socket.user) return;

    if (!this.typingUsers.has(groupId)) {
      this.typingUsers.set(groupId, new Map());
    }

    this.typingUsers.get(groupId)!.set(socket.userId, {
      userId: socket.userId,
      name: `${socket.user.firstName} ${socket.user.lastName}`,
      groupId
    });

    // Broadcast typing status
    socket.to(`group:${groupId}`).emit('typing_users', {
      groupId,
      users: Array.from(this.typingUsers.get(groupId)!.values())
    });

    // Auto-clear after 5 seconds
    setTimeout(() => {
      this.handleTypingStop(socket, groupId);
    }, 5000);
  }

  /**
   * Handle typing stop
   */
  private handleTypingStop(socket: AuthenticatedSocket, groupId: string): void {
    if (!socket.userId) return;

    const groupTyping = this.typingUsers.get(groupId);
    if (groupTyping) {
      groupTyping.delete(socket.userId);
      
      socket.to(`group:${groupId}`).emit('typing_users', {
        groupId,
        users: Array.from(groupTyping.values())
      });
    }
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: AuthenticatedSocket): void {
    console.log(`User disconnected: ${socket.user?.firstName} (${socket.userId})`);

    if (socket.userId) {
      this.onlineUsers.delete(socket.userId);

      // Clear from all typing lists
      this.typingUsers.forEach((groupTyping, groupId) => {
        if (groupTyping.has(socket.userId!)) {
          groupTyping.delete(socket.userId!);
          this.io?.to(`group:${groupId}`).emit('typing_users', {
            groupId,
            users: Array.from(groupTyping.values())
          });
        }
      });

      // Remove from room tracking
      this.groupRooms.forEach((sockets, groupId) => {
        if (sockets.has(socket.id)) {
          sockets.delete(socket.id);
          
          // Notify group
          this.io?.to(`group:${groupId}`).emit('user_left', {
            oderId: socket.userId,
            userName: `${socket.user?.firstName} ${socket.user?.lastName}`,
            groupId
          });
        }
      });
    }
  }

  /**
   * Get online users in a group
   */
  private getOnlineUsersInGroup(groupId: string): OnlineUser[] {
    const roomSockets = this.groupRooms.get(groupId);
    if (!roomSockets) return [];

    const users: OnlineUser[] = [];
    roomSockets.forEach(socketId => {
      const socket = this.io?.sockets.sockets.get(socketId) as AuthenticatedSocket;
      if (socket?.userId) {
        const user = this.onlineUsers.get(socket.userId);
        if (user) users.push(user);
      }
    });

    return users;
  }

  /**
   * Heartbeat to keep connections alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.io?.emit('heartbeat', { timestamp: Date.now() });
    }, 30000);
  }

  /**
   * Send system message to group
   */
  sendSystemMessage(groupId: string, content: string, metadata?: any): void {
    const message: ChatMessage = {
      id: `system-${Date.now()}`,
      groupId,
      senderId: 'system',
      senderName: 'System',
      content,
      type: 'system',
      metadata,
      timestamp: new Date().toISOString()
    };

    this.io?.to(`group:${groupId}`).emit('new_message', message);
  }

  /**
   * Broadcast to specific users
   */
  broadcastToUsers(userIds: string[], event: string, data: any): void {
    userIds.forEach(userId => {
      const user = this.onlineUsers.get(userId);
      if (user) {
        this.io?.to(user.socketId).emit(event, data);
      }
    });
  }

  /**
   * Send notification to a specific user
   */
  sendNotification(userId: string, notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): void {
    const user = this.onlineUsers.get(userId);
    if (user) {
      this.io?.to(user.socketId).emit('notification', notification);
    }
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToMany(userIds: string[], notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    data?: any;
  }): void {
    userIds.forEach(userId => this.sendNotification(userId, notification));
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Get all online user IDs
   */
  getOnlineUserIds(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * Get server stats
   */
  getStats(): {
    connectedUsers: number;
    activeRooms: number;
    totalSockets: number;
  } {
    return {
      connectedUsers: this.onlineUsers.size,
      activeRooms: this.groupRooms.size,
      totalSockets: this.io?.sockets.sockets.size || 0
    };
  }

  /**
   * Cleanup
   */
  shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.io?.close();
    this.onlineUsers.clear();
    this.groupRooms.clear();
    this.typingUsers.clear();
  }
}

export const websocketService = new WebSocketService();
export default websocketService;
