/**
 * GroupChat Component - Real-time chat interface for study groups
 * Connects to WebSocket service for bi-directional communication
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Smile, Image as ImageIcon, MoreVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth } from '../auth/AuthContext';
import { StudyGroupMessage } from '../../services/api/studyGroup.api';

interface GroupChatProps {
  groupId: string;
  messages: StudyGroupMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  isSending?: boolean;
}

export function GroupChat({ groupId, messages, onSendMessage, isLoading, isSending }: GroupChatProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    
    const content = newMessage.trim();
    setNewMessage('');
    
    try {
      await onSendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(content); // Restore message on error
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = formatDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, StudyGroupMessage[]>);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-400">
                  {date}
                </div>
              </div>

              {/* Messages */}
              {dateMessages.map((msg, idx) => {
                const isOwn = msg.userId === user?.id;
                const showAvatar = idx === 0 || dateMessages[idx - 1]?.userId !== msg.userId;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''} ${
                      showAvatar ? 'mt-4' : 'mt-1'
                    }`}
                  >
                    {/* Avatar */}
                    {showAvatar ? (
                      <div className={`size-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-medium ${
                        isOwn 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                          : 'bg-gradient-to-br from-green-500 to-teal-600'
                      }`}>
                        {(msg.user?.fullName || msg.user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    ) : (
                      <div className="size-8 flex-shrink-0" />
                    )}

                    {/* Message Bubble */}
                    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                      {showAvatar && !isOwn && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                          {msg.user?.fullName || msg.user?.email || 'Unknown User'}
                        </p>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                      <p className={`text-xs text-gray-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="pr-20"
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GroupChat;
