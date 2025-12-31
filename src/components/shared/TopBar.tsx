import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Menu,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown
} from 'lucide-react';
import { LogoIcon } from '../ui/Logo';
import { GlobalSearch } from './GlobalSearch';

export interface TopBarUser {
  name?: string;
  fullName?: string;
  subscription?: string;
  role?: string;
}

export interface TopBarProps {
  variant: 'user' | 'admin';
  user?: TopBarUser;
  brandName: string;
  brandSubtitle?: string;
  isDarkMode?: boolean;
  notificationCount?: number;
  onToggleDarkMode?: () => void;
  onToggleDrawer?: () => void;
  onToggleNotifications?: () => void;
  onProfileClick?: () => void;
  onExitAdmin?: () => void;
  showNotifications?: boolean;
  showProfile?: boolean;
  NotificationsPanel?: React.ReactNode;
  ProfileMenu?: React.ReactNode;
}

export function TopBar({
  variant,
  user,
  brandName,
  brandSubtitle,
  isDarkMode = false,
  notificationCount = 0,
  onToggleDarkMode,
  onToggleDrawer,
  onToggleNotifications,
  onProfileClick,
  onExitAdmin,
  showNotifications,
  showProfile,
  NotificationsPanel,
  ProfileMenu,
}: TopBarProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const displayName = user?.fullName || user?.name || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  
  const gradientClass = variant === 'admin' 
    ? 'from-purple-600 to-blue-600' 
    : 'from-blue-600 to-purple-600';

  return (
    <>
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
      <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <LogoIcon size="md" className="size-10" />
          <div className="hidden sm:block">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">{brandName}</span>
            {brandSubtitle && (
              <span className="text-xs text-gray-500 dark:text-gray-400 block">{brandSubtitle}</span>
            )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-6">
          <GlobalSearch variant={variant} className="w-full" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Search (mobile) */}
          <button 
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Search"
          >
            <Search className="size-5 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Notifications */}
          {variant === 'user' && (
            <div className="relative">
              <button 
                onClick={onToggleNotifications}
                className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Notifications"
              >
                <Bell className="size-5 text-gray-600 dark:text-gray-300" />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {showNotifications && NotificationsPanel}
            </div>
          )}

          {/* Dark Mode Toggle */}
          <button 
            onClick={onToggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? (
              <Sun className="size-5 text-yellow-500" />
            ) : (
              <Moon className="size-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* Divider */}
          <div className="hidden md:block h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

          {/* User Profile */}
          <div className="relative hidden md:flex items-center gap-2">
            <button 
              onClick={onProfileClick}
              className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <div className={`size-8 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                {initials}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                {variant === 'user' && user?.subscription && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.subscription}</p>
                )}
              </div>
              {variant === 'user' && <ChevronDown className="size-4 text-gray-400 hidden lg:block" />}
            </button>
            {showProfile && ProfileMenu}
          </div>

          {/* Exit Admin Button */}
          {variant === 'admin' && (
            <Button variant="outline" size="sm" onClick={onExitAdmin} className="hidden md:flex ml-2">
              Exit
            </Button>
          )}

          {/* Menu Toggle (mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleDrawer}
            className="lg:hidden dark:text-gray-300"
            title="Menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
    </header>

    {/* Mobile Search Overlay */}
    {showMobileSearch && (
      <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileSearch(false)}>
        <div 
          className="bg-white dark:bg-gray-900 p-4 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <GlobalSearch variant={variant} className="flex-1" />
            <button
              onClick={() => setShowMobileSearch(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              title="Close search"
            >
              <span className="text-gray-500 dark:text-gray-400">✕</span>
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
