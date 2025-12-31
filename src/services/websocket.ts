/**
 * WebSocket Client - Real-time communication for group chat
 */

import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'question' | 'resource' | 'announcement' | 'poll' | 'system';
  metadata?: any;
  timestamp: string;
}

export interface OnlineUser {
  userId: string;
  name: string;
  socketId: string;
  joinedAt: string;
}

export interface TypingUser {
  userId: string;
  name: string;
  groupId: string;
}

type MessageHandler = (message: ChatMessage) => void;
type OnlineUsersHandler = (data: { groupId: string; users: OnlineUser[] }) => void;
type TypingHandler = (data: { groupId: string; users: TypingUser[] }) => void;
type UserEventHandler = (data: { userId: string; userName: string; groupId: string }) => void;
type ErrorHandler = (error: { message: string }) => void;

class WebSocketClient {
  private socket: Socket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  // Event handlers
  private messageHandlers: Set<MessageHandler> = new Set();
  private onlineUsersHandlers: Set<OnlineUsersHandler> = new Set();
  private typingHandlers: Set<TypingHandler> = new Set();
  private userJoinedHandlers: Set<UserEventHandler> = new Set();
  private userLeftHandlers: Set<UserEventHandler> = new Set();
  private errorHandlers: Set<ErrorHandler> = new Set();
  private connectionHandlers: Set<(connected: boolean) => void> = new Set();

  /**
   * Initialize WebSocket connection
   */
  connect(token: string): void {
    if (this.socket?.connected) {
      // Already connected
      return;
    }

    this.token = token;
    const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

    this.socket = io(wsUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000
    });

    this.setupEventListeners();
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      // WebSocket connected
      this.reconnectAttempts = 0;
      this.connectionHandlers.forEach(handler => handler(true));
    });

    this.socket.on('disconnect', (reason) => {
      // WebSocket disconnected
      this.connectionHandlers.forEach(handler => handler(false));
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.errorHandlers.forEach(handler => 
          handler({ message: 'Unable to connect to chat server' })
        );
      }
    });

    // Chat events
    this.socket.on('new_message', (message: ChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    this.socket.on('online_users', (data: { groupId: string; users: OnlineUser[] }) => {
      this.onlineUsersHandlers.forEach(handler => handler(data));
    });

    this.socket.on('typing_users', (data: { groupId: string; users: TypingUser[] }) => {
      this.typingHandlers.forEach(handler => handler(data));
    });

    this.socket.on('user_joined', (data: { userId: string; userName: string; groupId: string }) => {
      this.userJoinedHandlers.forEach(handler => handler(data));
    });

    this.socket.on('user_left', (data: { userId: string; userName: string; groupId: string }) => {
      this.userLeftHandlers.forEach(handler => handler(data));
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('WebSocket error:', error);
      this.errorHandlers.forEach(handler => handler(error));
    });

    this.socket.on('heartbeat', (data: { timestamp: number }) => {
      // Keep-alive acknowledgment
    });
  }

  /**
   * Join a group chat room
   */
  joinGroup(groupId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join group: WebSocket not connected');
      return;
    }
    this.socket.emit('join_group', groupId);
  }

  /**
   * Leave a group chat room
   */
  leaveGroup(groupId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('leave_group', groupId);
  }

  /**
   * Send a message to a group
   */
  sendMessage(groupId: string, content: string, type: string = 'text', metadata?: any): void {
    if (!this.socket?.connected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }
    this.socket.emit('send_message', { groupId, content, type, metadata });
  }

  /**
   * Start typing indicator
   */
  startTyping(groupId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_start', groupId);
  }

  /**
   * Stop typing indicator
   */
  stopTyping(groupId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_stop', groupId);
  }

  /**
   * Get online users in a group
   */
  getOnlineUsers(groupId: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('get_online_users', groupId);
  }

  // Event subscription methods
  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onOnlineUsers(handler: OnlineUsersHandler): () => void {
    this.onlineUsersHandlers.add(handler);
    return () => this.onlineUsersHandlers.delete(handler);
  }

  onTyping(handler: TypingHandler): () => void {
    this.typingHandlers.add(handler);
    return () => this.typingHandlers.delete(handler);
  }

  onUserJoined(handler: UserEventHandler): () => void {
    this.userJoinedHandlers.add(handler);
    return () => this.userJoinedHandlers.delete(handler);
  }

  onUserLeft(handler: UserEventHandler): () => void {
    this.userLeftHandlers.add(handler);
    return () => this.userLeftHandlers.delete(handler);
  }

  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler);
    return () => this.errorHandlers.delete(handler);
  }

  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler);
    return () => this.connectionHandlers.delete(handler);
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.messageHandlers.clear();
    this.onlineUsersHandlers.clear();
    this.typingHandlers.clear();
    this.userJoinedHandlers.clear();
    this.userLeftHandlers.clear();
    this.errorHandlers.clear();
    this.connectionHandlers.clear();
  }
}

// Singleton instance
export const wsClient = new WebSocketClient();
export default wsClient;
