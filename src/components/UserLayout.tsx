import { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  LayoutDashboard, 
  Brain, 
  BookOpen, 
  TrendingUp, 
  BarChart3,
  MessageSquare,
  Users,
  Calendar,
  Crown,
  BookMarked,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Target,
  Bell,
  Settings,
  ChevronRight,
  Search,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  MessagesSquare,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { Input } from './ui/input';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfileMenu } from './ProfileMenu';
import { useDarkMode } from './DarkModeContext';

interface UserLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & insights', group: 'main' },
  { id: 'cat-test', label: 'CAT Test', icon: Target, description: 'Adaptive testing', group: 'practice' },
  { id: 'nclex-simulator', label: 'NCLEX Simulator', icon: Brain, description: 'Full exam simulation', group: 'practice' },
  { id: 'quiz', label: 'Practice Quiz', icon: BookOpen, description: 'Topic-based practice', group: 'practice' },
  { id: 'flashcards', label: 'Flashcards', icon: BookMarked, description: 'Study cards', group: 'study' },
  { id: 'books', label: 'My Books', icon: BookOpen, description: 'NCLEX ebooks', group: 'study' },
  { id: 'ai-chat', label: 'AI Chat', icon: Sparkles, description: 'Study assistant', group: 'study' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, description: 'Track improvement', group: 'analytics' },
  { id: 'analytics', label: 'AI Analytics', icon: BarChart3, description: 'Performance insights', group: 'analytics' },
  { id: 'planner', label: 'Study Planner', icon: Calendar, description: 'Schedule & goals', group: 'tools' },
  { id: 'forum', label: 'Forum', icon: MessagesSquare, description: 'Community discussions', group: 'tools' },
  { id: 'group-study', label: 'Group Study', icon: Users, description: 'Study with peers', group: 'tools' },
  { id: 'subscription', label: 'Subscription', icon: Crown, description: 'Manage plan', group: 'settings' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'App preferences', group: 'settings' },
  { id: 'profile', label: 'My Profile', icon: Brain, description: 'Personal information', group: 'settings' },
];

const menuGroups = [
  { id: 'main', label: 'Main' },
  { id: 'practice', label: 'Practice & Testing' },
  { id: 'study', label: 'Study Resources' },
  { id: 'analytics', label: 'Progress & Analytics' },
  { id: 'tools', label: 'Tools & Community' },
  { id: 'settings', label: 'Settings' },
];

export function UserLayout({ children, currentView, onNavigate }: UserLayoutProps) {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications] = useState(2);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleNavigation = (view: string) => {
    onNavigate(view);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Top Navigation Bar */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <GraduationCap className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-white">Haven Institute</h1>
                <p className="text-gray-500 dark:text-gray-400 hidden sm:block">Excellence in NCLEX Preparation</p>
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search topics, questions, or resources..."
                  className="pl-10 bg-gray-50 dark:bg-gray-800 dark:text-white dark:border-gray-700"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="size-5 text-yellow-500" />
                ) : (
                  <Moon className="size-5 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Bell className="size-5 text-gray-600 dark:text-gray-300" />
                  {notifications > 0 && (
                    <span className="absolute top-1 right-1 size-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationsPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>

              {/* Settings */}
              <button 
                onClick={() => handleNavigation('settings')}
                className="hidden md:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Settings className="size-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* User Profile */}
              <div className="relative hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right">
                  <p className="text-gray-900 dark:text-white">{user?.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.subscription} Plan</p>
                </div>
                <button 
                  onClick={() => setShowProfile(!showProfile)}
                  className="size-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>
                {showProfile && (
                  <ProfileMenu 
                    onClose={() => setShowProfile(false)} 
                    onNavigate={handleNavigation}
                  />
                )}
              </div>

              {/* Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="lg:hidden dark:text-gray-300"
              >
                <Menu className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Desktop */}
        <aside className={`hidden lg:block bg-white border-r border-gray-200 h-[calc(100vh-81px)] sticky top-[81px] transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-72'
        } flex flex-col`}>
          {/* Collapse Toggle Button */}
          <div className="flex justify-end p-3 border-b border-gray-200 flex-shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeft className="size-5 text-gray-600 group-hover:text-blue-600" />
              ) : (
                <PanelLeftClose className="size-5 text-gray-600 group-hover:text-blue-600" />
              )}
            </button>
          </div>

          <nav className="p-4 space-y-1 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
            {menuGroups.map((group) => (
              <div key={group.id} className="mb-4">
                {!sidebarCollapsed && (
                  <p className="text-xs uppercase tracking-wider text-gray-500 px-4 py-2 mb-1">{group.label}</p>
                )}
                {sidebarCollapsed && group.id !== 'main' && (
                  <div className="h-px bg-gray-200 mx-2 my-2"></div>
                )}
                <div className="space-y-1">
                  {menuItems
                    .filter((item) => item.group === group.id)
                    .map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigation(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                            isActive
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                              : 'text-gray-700 hover:bg-gray-100'
                          } ${sidebarCollapsed ? 'justify-center' : ''}`}
                          title={sidebarCollapsed ? item.label : ''}
                        >
                          <Icon className={`size-5 ${isActive ? 'text-white' : 'text-gray-500'} ${sidebarCollapsed ? 'shrink-0' : ''}`} />
                          {!sidebarCollapsed && (
                            <>
                              <div className="flex-1 text-left">
                                <p className={`text-sm ${isActive ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                                <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {item.description}
                                </p>
                              </div>
                              {isActive && <ChevronRight className="size-4" />}
                            </>
                          )}
                          {/* Tooltip for collapsed mode */}
                          {sidebarCollapsed && (
                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                              <div>{item.label}</div>
                              <div className="text-xs text-gray-300">{item.description}</div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Logout Button */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors ${
                  sidebarCollapsed ? 'justify-center' : ''
                }`}
                title={sidebarCollapsed ? 'Logout' : ''}
              >
                <LogOut className="size-5" />
                {!sidebarCollapsed && (
                  <div className="flex-1 text-left">
                    <p>Logout</p>
                    <p className="text-xs text-gray-500">Sign out of account</p>
                  </div>
                )}
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>

        {/* Right Drawer - Mobile */}
        {drawerOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 lg:hidden transform transition-transform">
              {/* Drawer Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-900">Navigation</h3>
                  <button
                    onClick={() => setDrawerOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                  <div className="size-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-md">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{user?.name}</p>
                    <Badge className={`mt-1 ${
                      user?.subscription === 'Premium' ? 'bg-yellow-100 text-yellow-800' :
                      user?.subscription === 'Pro' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.subscription === 'Premium' && '👑 '}
                      {user?.subscription === 'Pro' && '⭐ '}
                      {user?.subscription}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Drawer Navigation */}
              <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-280px)]">
                {menuGroups.map((group) => (
                  <div key={group.id}>
                    <p className="text-sm text-gray-500 font-bold mb-2">{group.label}</p>
                    {menuItems
                      .filter((item) => item.group === group.id)
                      .map((item) => {
                        const Icon = item.icon;
                        const isActive = currentView === item.id;
                        
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleNavigation(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                              isActive
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className={`size-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                            <div className="flex-1 text-left">
                              <p className={isActive ? 'text-white' : 'text-gray-900'}>{item.label}</p>
                              <p className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                                {item.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                ))}
              </nav>

              {/* Drawer Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2 bg-white">
                <Button 
                  variant="outline" 
                  onClick={() => handleNavigation('subscription')} 
                  className="w-full"
                >
                  <Crown className="size-4 mr-2" />
                  Manage Subscription
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleLogout} 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="size-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}