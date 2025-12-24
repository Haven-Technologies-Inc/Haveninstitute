/**
 * Group Chat Page - Real-time chat for study groups with WebSocket
 */

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import {
  Send,
  Users,
  ArrowLeft,
  Circle,
  Settings,
  Calendar,
  MoreVertical,
  Smile,
  Paperclip,
  FileQuestion,
  AtSign
} from 'lucide-react';
import { useStudyGroup, useGroupSessions } from '../../services/hooks/useStudyGroups';
import { useWebSocket, useGroupChat } from '../../services/hooks/useChat';
import { useAuth } from '../../components/auth/AuthContext';
import { ChatMessage } from '../../services/websocket';

export default function GroupChatPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = localStorage.getItem('token'); // Get token from storage
  const [messageInput, setMessageInput] = useState('');
  const [showMembers, setShowMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // WebSocket connection
  const { isConnected, error: wsError } = useWebSocket(token);
  
  // Group chat functionality
  const {
    messages,
    onlineUsers,
    typingUsers,
    isLoading: chatLoading,
    sendMessage,
    handleTyping
  } = useGroupChat(groupId || null);

  // Group data
  const { data: group, isLoading: groupLoading } = useStudyGroup(groupId || '');
  const { data: sessions } = useGroupSessions(groupId || '', { status: 'scheduled', limit: 3 });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle send message
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput.trim());
    setMessageInput('');
    inputRef.current?.focus();
  };

  // Handle input change with typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    handleTyping();
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for message grouping
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  // Message component
  const MessageBubble = ({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) => {
    if (message.type === 'system') {
      return (
        <div className="flex justify-center my-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
            {message.content}
          </span>
        </div>
      );
    }

    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
        <div className={`max-w-[70%] ${isOwn ? 'order-2' : ''}`}>
          {!isOwn && (
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 ml-2 mb-1 block">
              {message.senderName}
            </span>
          )}
          <div
            className={`px-4 py-2 rounded-2xl ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
            }`}
          >
            {message.type === 'question' && (
              <div className="flex items-center gap-1 text-xs mb-1 opacity-80">
                <FileQuestion className="size-3" />
                Question
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <span className={`text-xs text-gray-400 mt-1 block ${isOwn ? 'text-right mr-2' : 'ml-2'}`}>
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  };

  if (groupLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Group not found</h2>
        <Button onClick={() => navigate('/app/group-study')}>Back to Groups</Button>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/group-study')}>
              <ArrowLeft className="size-5" />
            </Button>
            <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
              {group.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white">{group.name}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Circle className={`size-2 ${isConnected ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`} />
                  {isConnected ? `${onlineUsers.length} online` : 'Connecting...'}
                </span>
                <span>•</span>
                <span>{group.memberCount} members</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowMembers(!showMembers)}>
              <Users className="size-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="size-5" />
            </Button>
          </div>
        </div>

        {/* Connection Status Banner */}
        {wsError && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-4 py-2 text-sm text-center">
            Connection error: {wsError}. Retrying...
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950">
          {chatLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="size-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <Send className="size-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Start the conversation</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Be the first to send a message in this study group!
              </p>
            </div>
          ) : (
            <div>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
                      {date}
                    </span>
                  </div>
                  {msgs.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === user?.id}
                    />
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 px-4 py-2">
              <div className="flex gap-1">
                <span className="animate-bounce size-2 bg-gray-400 rounded-full" style={{ animationDelay: '0ms' }}></span>
                <span className="animate-bounce size-2 bg-gray-400 rounded-full" style={{ animationDelay: '150ms' }}></span>
                <span className="animate-bounce size-2 bg-gray-400 rounded-full" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span>
                {typingUsers.map(u => u.name).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-gray-500">
              <Paperclip className="size-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className="pr-20"
                disabled={!isConnected}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-8 text-gray-500">
                  <AtSign className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" className="size-8 text-gray-500">
                  <Smile className="size-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleSendMessage} 
              disabled={!messageInput.trim() || !isConnected}
              className="px-4"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar - Members & Sessions */}
      {showMembers && (
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-y-auto">
          {/* Online Members */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Circle className="size-2 fill-green-500 text-green-500" />
              Online ({onlineUsers.length})
            </h3>
            <div className="space-y-2">
              {onlineUsers.map((onlineUser) => (
                <div key={onlineUser.oderId || onlineUser.socketId} className="flex items-center gap-3 py-2">
                  <div className="size-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                    {onlineUser.name.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{onlineUser.name}</span>
                </div>
              ))}
              {onlineUsers.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">No one online yet</p>
              )}
            </div>
          </div>

          {/* Group Members */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Members ({group.memberCount})
            </h3>
            <div className="space-y-2">
              {group.members?.slice(0, 10).map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium">
                      {member.user?.firstName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {member.user?.firstName} {member.user?.lastName}
                      </span>
                      {member.role !== 'member' && (
                        <Badge variant="secondary" className="ml-2 text-xs">{member.role}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Sessions */}
          {sessions && sessions.length > 0 && (
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Calendar className="size-4" />
                Upcoming Sessions
              </h3>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card key={session.id} className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 dark:text-white">{session.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(session.scheduledStart).toLocaleDateString()} at{' '}
                      {new Date(session.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
