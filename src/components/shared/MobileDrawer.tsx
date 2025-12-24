import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, LogOut, Crown, Moon, Sun, LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
}

export interface MenuGroup {
  id: string;
  label: string;
}

export interface MobileDrawerUser {
  name?: string;
  fullName?: string;
  subscription?: string;
}

export interface MobileDrawerProps {
  variant: 'user' | 'admin';
  isOpen: boolean;
  user?: MobileDrawerUser;
  menuItems: MenuItem[];
  menuGroups: MenuGroup[];
  activeItem: string;
  isDarkMode?: boolean;
  onClose: () => void;
  onItemClick: (id: string) => void;
  onToggleDarkMode?: () => void;
  onLogout?: () => void;
  onExitAdmin?: () => void;
}

export function MobileDrawer({
  variant,
  isOpen,
  user,
  menuItems,
  menuGroups,
  activeItem,
  isDarkMode = false,
  onClose,
  onItemClick,
  onToggleDarkMode,
  onLogout,
  onExitAdmin,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  const displayName = user?.fullName || user?.name || 'User';
  const initials = displayName.charAt(0).toUpperCase();
  
  const gradientClass = variant === 'admin' 
    ? 'from-purple-600 to-blue-600' 
    : 'from-blue-600 to-purple-600';
  
  const bgGradientClass = variant === 'admin'
    ? 'from-purple-50 to-blue-50'
    : 'from-blue-50 to-purple-50';

  const handleItemClick = (id: string) => {
    onItemClick(id);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 lg:hidden transform transition-transform flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Close menu"
            >
              <X className="size-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          
          {/* User Info */}
          <div className={`flex items-center gap-3 p-3 bg-gradient-to-br ${bgGradientClass} dark:from-gray-800 dark:to-gray-700 rounded-lg`}>
            <div className={`size-12 bg-gradient-to-br ${gradientClass} rounded-full flex items-center justify-center text-white text-lg font-medium shadow-md`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 dark:text-white font-medium truncate">{displayName}</p>
              {variant === 'user' && user?.subscription && (
                <Badge className={`mt-1 text-xs ${
                  user.subscription === 'Premium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  user.subscription === 'Pro' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {user.subscription}
                </Badge>
              )}
              {variant === 'admin' && (
                <span className="text-xs text-gray-500 dark:text-gray-400">Administrator</span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          {menuGroups.map((group) => (
            <div key={group.id} className="mb-4">
              {group.label && (
                <p className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 px-3 py-2">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {menuItems
                  .filter((item) => item.group === group.id)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeItem === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? `bg-gradient-to-r ${gradientClass} text-white shadow-md`
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className={`size-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                        <span className={`text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2 flex-shrink-0">
          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDarkMode ? (
              <Sun className="size-5 text-yellow-500" />
            ) : (
              <Moon className="size-5 text-gray-500" />
            )}
            <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {variant === 'user' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => handleItemClick('subscription')} 
                className="w-full"
              >
                <Crown className="size-4 mr-2" />
                Manage Plan
              </Button>
              <Button 
                variant="ghost" 
                onClick={onLogout} 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="size-4 mr-2" />
                Logout
              </Button>
            </>
          )}

          {variant === 'admin' && (
            <Button variant="outline" onClick={onExitAdmin} className="w-full">
              Exit Admin
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
