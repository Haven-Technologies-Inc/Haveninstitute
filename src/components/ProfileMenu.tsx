import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User, 
  Settings, 
  Crown, 
  LogOut,
  BookOpen,
  TrendingUp,
  Award,
  ChevronRight,
  Mail,
  Calendar
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';

interface ProfileMenuProps {
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function ProfileMenu({ onClose, onNavigate }: ProfileMenuProps) {
  const { user, logout } = useAuth();

  const handleNavigation = (view: string) => {
    onNavigate(view);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Get user stats - use actual data if available, otherwise show placeholder
  const userStats = {
    quizzes: user?.stats?.quizzesCompleted ?? 0,
    avgScore: user?.stats?.averageScore ?? 0,
    studyTime: user?.stats?.totalStudyHours ?? 0,
  };

  // Format member since date
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'progress', label: 'My Progress', icon: Award },
    { id: 'books', label: 'My Books', icon: BookOpen },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getSubscriptionBadge = () => {
    const tier = user?.subscription || 'Free';
    switch (tier) {
      case 'Premium':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">👑 Premium</Badge>;
      case 'Pro':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">⭐ Pro</Badge>;
      default:
        return <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">Free</Badge>;
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
      {/* Profile Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-t-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="size-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg text-2xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Mail className="size-3" />
              {user?.email}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          {getSubscriptionBadge()}
          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Calendar className="size-3" />
            Member since {memberSince}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userStats.quizzes}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Quizzes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userStats.avgScore}%</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Avg Score</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{userStats.studyTime}h</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Study Time</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="p-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <Icon className="size-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              <span className="flex-1 text-left text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                {item.label}
              </span>
              <ChevronRight className="size-4 text-gray-400 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
        >
          <LogOut className="size-5 text-gray-500 dark:text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" />
          <span className="flex-1 text-left text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">
            Logout
          </span>
        </button>
      </div>
    </div>
  );
}
