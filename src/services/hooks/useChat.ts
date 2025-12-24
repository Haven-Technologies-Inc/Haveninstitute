/**
 * Chat Hooks - React hooks for real-time WebSocket chat
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { wsClient, ChatMessage, OnlineUser, TypingUser } from '../websocket';

/**
 * Hook to manage WebSocket connection
 */
export function useWebSocket(token: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    wsClient.connect(token);

    const unsubConnect = wsClient.onConnectionChange(setIsConnected);
    const unsubError = wsClient.onError((err) => setError(err.message));

    return () => {
      unsubConnect();
      unsubError();
      wsClient.disconnect();
    };
  }, [token]);

  return { isConnected, error };
}

/**
 * Hook for group chat functionality
 */
export function useGroupChat(groupId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join/leave group
  useEffect(() => {
    if (!groupId) return;

    setIsLoading(true);
    setMessages([]);
    wsClient.joinGroup(groupId);

    // Small delay to allow connection
    const timeout = setTimeout(() => setIsLoading(false), 500);

    return () => {
      clearTimeout(timeout);
      wsClient.leaveGroup(groupId);
    };
  }, [groupId]);

  // Subscribe to messages
  useEffect(() => {
    const unsubMessage = wsClient.onMessage((message) => {
      if (message.groupId === groupId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    const unsubOnline = wsClient.onOnlineUsers((data) => {
      if (data.groupId === groupId) {
        setOnlineUsers(data.users);
      }
    });

    const unsubTyping = wsClient.onTyping((data) => {
      if (data.groupId === groupId) {
        setTypingUsers(data.users);
      }
    });

    const unsubJoined = wsClient.onUserJoined((data) => {
      if (data.groupId === groupId) {
        // Add system message
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          groupId: data.groupId,
          senderId: 'system',
          senderName: 'System',
          content: `${data.userName} joined the chat`,
          type: 'system',
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    });

    const unsubLeft = wsClient.onUserLeft((data) => {
      if (data.groupId === groupId) {
        const systemMessage: ChatMessage = {
          id: `system-${Date.now()}`,
          groupId: data.groupId,
          senderId: 'system',
          senderName: 'System',
          content: `${data.userName} left the chat`,
          type: 'system',
          timestamp: new Date().toISOString()
        };
        setMessages((prev) => [...prev, systemMessage]);
      }
    });

    return () => {
      unsubMessage();
      unsubOnline();
      unsubTyping();
      unsubJoined();
      unsubLeft();
    };
  }, [groupId]);

  // Send message
  const sendMessage = useCallback((content: string, type: string = 'text', metadata?: any) => {
    if (!groupId || !content.trim()) return;
    wsClient.sendMessage(groupId, content, type, metadata);
  }, [groupId]);

  // Handle typing
  const handleTyping = useCallback(() => {
    if (!groupId) return;
    
    wsClient.startTyping(groupId);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      wsClient.stopTyping(groupId);
    }, 3000);
  }, [groupId]);

  // Refresh online users
  const refreshOnlineUsers = useCallback(() => {
    if (!groupId) return;
    wsClient.getOnlineUsers(groupId);
  }, [groupId]);

  return {
    messages,
    onlineUsers,
    typingUsers,
    isLoading,
    sendMessage,
    handleTyping,
    refreshOnlineUsers
  };
}

/**
 * Hook for typing indicator with debounce
 */
export function useTypingIndicator(groupId: string | null) {
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!groupId) return;
    
    if (!isTyping) {
      setIsTyping(true);
      wsClient.startTyping(groupId);
    }

    // Reset timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      wsClient.stopTyping(groupId);
    }, 3000);
  }, [groupId, isTyping]);

  const stopTyping = useCallback(() => {
    if (!groupId) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsTyping(false);
    wsClient.stopTyping(groupId);
  }, [groupId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { isTyping, startTyping, stopTyping };
}
