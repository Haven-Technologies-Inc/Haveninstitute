import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  Bell, 
  BookOpen, 
  Trophy, 
  Target, 
  Calendar, 
  CheckCircle2,
  X,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'system' | 'quiz';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  icon?: any;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'achievement',
    title: 'New Achievement Unlocked!',
    message: 'You completed 5 quizzes this week',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
    icon: Trophy
  },
  {
    id: '2',
    type: 'reminder',
    title: 'Study Session Reminder',
    message: 'Your planned study session starts in 30 minutes',
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: false,
    icon: Calendar
  },
  {
    id: '3',
    type: 'quiz',
    title: 'Quiz Score Available',
    message: 'Your Pharmacology quiz score: 85%',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
    icon: Target
  },
  {
    id: '4',
    type: 'system',
    title: 'New Study Material',
    message: 'New chapter added to NCLEX Review Book',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
    icon: BookOpen
  }
];

interface NotificationsPanelProps {
  onClose: () => void;
}

export function NotificationsPanel({ onClose }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'reminder':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'quiz':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <Badge className="bg-red-600 text-white">{unreadCount}</Badge>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="size-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        {notifications.length > 0 && (
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs dark:text-gray-300 dark:hover:bg-gray-700"
              >
                <CheckCircle2 className="size-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs text-red-600 dark:text-red-400 dark:hover:bg-gray-700"
            >
              <Trash2 className="size-3 mr-1" />
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="h-[400px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
            <Bell className="size-12 mb-3 text-gray-400 dark:text-gray-600" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => {
              const Icon = notification.icon || Bell;
              return (
                <div
                  key={notification.id}
                  className={`p-3 mb-2 rounded-lg transition-all cursor-pointer group ${
                    notification.read
                      ? 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      : 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${getNotificationColor(notification.type)}`}>
                      <Icon className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <X className="size-3 text-gray-500 dark:text-gray-400" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button variant="ghost" className="w-full text-sm dark:text-gray-300 dark:hover:bg-gray-700">
            View all notifications
          </Button>
        </div>
      )}
    </div>
  );
}
