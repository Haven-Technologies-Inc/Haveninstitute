import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  PanelLeft,
  BarChart3,
  Moon,
  Sun,
  Search,
  BookOpen,
  Layers,
  Upload,
  Globe,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
}

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Dashboard overview' },
  { id: 'upload', label: 'Upload Questions', icon: Upload, description: 'Bulk question upload' },
  { id: 'manage', label: 'Manage Questions', icon: FileText, description: 'Edit & organize' },
  { id: 'content', label: 'Content Management', icon: Layers, description: 'All content types' },
  { id: 'books', label: 'Book Management', icon: BookOpen, description: 'Manage study books' },
  { id: 'website', label: 'Website Content', icon: Globe, description: 'Landing page content' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Performance insights' },
  { id: 'users', label: 'User Management', icon: Users, description: 'Manage users' },
  { id: 'revenue', label: 'Revenue & Billing', icon: DollarSign, description: 'Financial metrics' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'System settings' },
];

export function AdminLayout({ children, activeTab, onTabChange, onExit }: AdminLayoutProps) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-2.5 rounded-xl shadow-lg">
                <GraduationCap className="size-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">Haven Institute Admin</h1>
                <p className="text-gray-500">Content Management System</p>
              </div>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="Search questions, users, or content..."
                  className="pl-10 bg-gray-50"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* User Profile */}
              <div className="hidden md:flex items-center gap-3 pl-3 border-l border-gray-200 dark:border-gray-700">
                <div className="text-right">
                  <p className="text-gray-900 dark:text-white">{user?.fullName || user?.name}</p>
                  <button
                    onClick={toggleDarkMode}
                    className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-sm"
                    title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {darkMode ? (
                      <>
                        <Sun className="size-3.5" />
                        <span>Light Mode</span>
                      </>
                    ) : (
                      <>
                        <Moon className="size-3.5" />
                        <span>Dark Mode</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="size-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
                  {(user?.fullName || user?.name)?.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Exit Admin Button */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={onExit} className="hidden md:flex">
                  Exit Admin
                </Button>

                {/* Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(!drawerOpen)}
                  className="lg:hidden"
                >
                  <Menu className="size-5" />
                </Button>
              </div>
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
                <PanelLeft className="size-5 text-gray-600 group-hover:text-purple-600" />
              ) : (
                <ChevronLeft className="size-5 text-gray-600 group-hover:text-purple-600" />
              )}
            </button>
          </div>

          <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
                  title={sidebarCollapsed ? item.label : ''}
                >
                  <Icon className={`size-5 ${isActive ? 'text-white' : 'text-gray-500'} ${sidebarCollapsed ? 'shrink-0' : ''}`} />
                  {!sidebarCollapsed && (
                    <>
                      <div className="flex-1 text-left">
                        <p className={isActive ? 'text-white' : 'text-gray-900'}>{item.label}</p>
                        <p className={`text-xs ${isActive ? 'text-purple-100' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                      {isActive && <ChevronRight className="size-4" />}
                    </>
                  )}
                </button>
              );
            })}
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
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                  <div className="size-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-md">
                    {(user?.fullName || user?.name)?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{user?.fullName || user?.name}</p>
                    <button
                      onClick={toggleDarkMode}
                      className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 transition-colors text-sm mt-1"
                    >
                      {darkMode ? (
                        <>
                          <Sun className="size-3.5" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="size-3.5" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Drawer Navigation */}
              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onTabChange(item.id);
                        setDrawerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`size-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                      <div className="flex-1 text-left">
                        <p className={isActive ? 'text-white' : 'text-gray-900'}>{item.label}</p>
                        <p className={`text-xs ${isActive ? 'text-purple-100' : 'text-gray-500'}`}>
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
                <Button variant="outline" onClick={onExit} className="w-full">
                  Exit Admin
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}