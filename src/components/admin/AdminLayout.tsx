import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  DollarSign,
  Settings,
  BookOpen,
  Layers,
  Upload,
  Globe,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { TopBar } from '../shared/TopBar';
import { Sidebar } from '../shared/Sidebar';
import { MobileDrawer } from '../shared/MobileDrawer';

// Admin menu configuration - Single source of truth (DRY)
const ADMIN_MENU_ITEMS = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'upload', label: 'Upload Questions', icon: Upload, group: 'content' },
  { id: 'manage', label: 'Question Bank', icon: FileText, group: 'content' },
  { id: 'books', label: 'Study Materials', icon: BookOpen, group: 'content' },
  { id: 'content', label: 'All Content', icon: Layers, group: 'content' },
  { id: 'website', label: 'Website Editor', icon: Globe, group: 'website' },
  { id: 'users', label: 'Users', icon: Users, group: 'users' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, group: 'users' },
  { id: 'revenue', label: 'Revenue', icon: DollarSign, group: 'business' },
  { id: 'settings', label: 'Settings', icon: Settings, group: 'business' },
];

const ADMIN_MENU_GROUPS = [
  { id: 'main', label: '' },
  { id: 'content', label: 'Content Management' },
  { id: 'website', label: 'Website' },
  { id: 'users', label: 'Users & Analytics' },
  { id: 'business', label: 'Business' },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onExit: () => void;
}

export function AdminLayout({ children, activeTab, onTabChange, onExit }: AdminLayoutProps) {
  const { user } = useAuth();
  
  // UI State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
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

  const handleNavigation = (id: string) => {
    onTabChange(id);
    setDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Adaptive TopBar - Admin variant */}
      <TopBar
        variant="admin"
        user={user}
        brandName="Haven Admin"
        brandSubtitle="CMS"
        isDarkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
        onExitAdmin={onExit}
      />

      <div className="flex">
        {/* Reusable Sidebar - Admin variant */}
        <Sidebar
          variant="admin"
          menuItems={ADMIN_MENU_ITEMS}
          menuGroups={ADMIN_MENU_GROUPS}
          activeItem={activeTab}
          collapsed={sidebarCollapsed}
          onItemClick={handleNavigation}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Reusable Mobile Drawer - Admin variant */}
      <MobileDrawer
        variant="admin"
        isOpen={drawerOpen}
        user={user}
        menuItems={ADMIN_MENU_ITEMS}
        menuGroups={ADMIN_MENU_GROUPS}
        activeItem={activeTab}
        isDarkMode={darkMode}
        onClose={() => setDrawerOpen(false)}
        onItemClick={handleNavigation}
        onToggleDarkMode={toggleDarkMode}
        onExitAdmin={onExit}
      />
    </div>
  );
}
