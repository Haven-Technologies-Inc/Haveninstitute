import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { 
  LayoutDashboard, 
  Brain, 
  BookOpen, 
  TrendingUp, 
  BarChart3,
  Users,
  Calendar,
  Crown,
  BookMarked,
  Target,
  Settings,
  Sparkles,
  MessagesSquare,
} from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { useDarkMode } from './DarkModeContext';
import { NotificationsPanel } from './NotificationsPanel';
import { ProfileMenu } from './ProfileMenu';
import { TopBar } from './shared/TopBar';
import { Sidebar } from './shared/Sidebar';
import { MobileDrawer } from './shared/MobileDrawer';

// Menu configuration - Single source of truth (DRY)
const USER_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'home' },
  { id: 'nclex-simulator', label: 'NCLEX Simulator', icon: Brain, group: 'exams' },
  { id: 'cat-test', label: 'Adaptive Test', icon: Target, group: 'exams' },
  { id: 'quiz', label: 'Quick Practice', icon: BookOpen, group: 'exams' },
  { id: 'flashcards', label: 'Flashcards', icon: BookMarked, group: 'study' },
  { id: 'books', label: 'Study Library', icon: BookOpen, group: 'study' },
  { id: 'ai-chat', label: 'AI Tutor', icon: Sparkles, group: 'study' },
  { id: 'progress', label: 'My Progress', icon: TrendingUp, group: 'progress' },
  { id: 'analytics', label: 'Insights', icon: BarChart3, group: 'progress' },
  { id: 'planner', label: 'Study Planner', icon: Calendar, group: 'progress' },
  { id: 'study-groups', label: 'Study Groups', icon: Users, group: 'community' },
  { id: 'discussions', label: 'Discussions', icon: MessagesSquare, group: 'community' },
  { id: 'subscription', label: 'My Plan', icon: Crown, group: 'account' },
  { id: 'profile', label: 'Profile', icon: Settings, group: 'account' },
];

const USER_MENU_GROUPS = [
  { id: 'home', label: '' },
  { id: 'exams', label: 'Practice & Exams' },
  { id: 'study', label: 'Study Materials' },
  { id: 'progress', label: 'Progress & Planning' },
  { id: 'community', label: 'Community' },
  { id: 'account', label: 'Account' },
];

interface UserLayoutProps {
  children: React.ReactNode;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export function UserLayout({ children, currentView: propCurrentView, onNavigate }: UserLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  
  // Reverse map routes to menu IDs for active state
  const getActiveMenuId = (pathname: string): string => {
    const reverseMap: Record<string, string> = {
      '/app/dashboard': 'dashboard',
      '/app/practice': 'practice',
      '/app/practice/unified': 'practice',
      '/app/practice/session': 'practice',
      '/app/practice/nclex': 'practice',
      '/app/practice/cat': 'cat-test',
      '/app/practice/quiz': 'practice',
      '/app/study/flashcards': 'flashcards',
      '/app/study/books': 'books',
      '/app/study/ai': 'ai-chat',
      '/app/progress': 'progress',
      '/app/progress/analytics': 'analytics',
      '/app/progress/planner': 'planner',
      '/app/community/groups': 'study-groups',
      '/app/account/subscription': 'subscription',
      '/app/account/profile': 'profile',
      '/app/account/settings': 'settings',
    };
    return reverseMap[pathname] || pathname.split('/').pop() || 'dashboard';
  };

  // Get current view from URL path or prop
  const currentView = propCurrentView || getActiveMenuId(location.pathname);
  
  // UI State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  // Mock notification count - would come from API in production
  const notificationCount = 2;

  // Map menu IDs to actual route paths
  const routeMap: Record<string, string> = {
    'dashboard': '/app/dashboard',
    'practice': '/app/practice/unified',
    'nclex-simulator': '/app/practice/unified',
    'cat-test': '/app/practice/cat',
    'quiz': '/app/practice/unified',
    'quick-practice': '/app/practice/unified',
    'flashcards': '/app/study/flashcards',
    'books': '/app/study/books',
    'ai-chat': '/app/study/ai',
    'progress': '/app/progress',
    'analytics': '/app/progress/analytics',
    'planner': '/app/progress/planner',
    'study-groups': '/app/community/groups',
    'discussions': '/app/discussions',
    'subscription': '/app/account/subscription',
    'profile': '/app/account/profile',
    'settings': '/app/account/settings',
  };

  const handleNavigation = (view: string) => {
    const route = routeMap[view] || `/app/${view}`;
    if (onNavigate) {
      onNavigate(view);
    } else {
      navigate(route);
    }
    setDrawerOpen(false);
    setShowProfile(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Sidebar footer with logout button
  const sidebarFooter = (
    <button
      onClick={handleLogout}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors ${
        sidebarCollapsed ? 'justify-center' : ''
      }`}
      title={sidebarCollapsed ? 'Logout' : ''}
    >
      <LogOut className="size-5 flex-shrink-0" />
      {!sidebarCollapsed && <span className="text-sm font-medium">Logout</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Adaptive TopBar */}
      <TopBar
        variant="user"
        user={user}
        brandName="Haven Institute"
        isDarkMode={isDarkMode}
        notificationCount={notificationCount}
        onToggleDarkMode={toggleDarkMode}
        onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
        onToggleNotifications={() => setShowNotifications(!showNotifications)}
        onProfileClick={() => setShowProfile(!showProfile)}
        showNotifications={showNotifications}
        showProfile={showProfile}
        NotificationsPanel={<NotificationsPanel onClose={() => setShowNotifications(false)} />}
        ProfileMenu={<ProfileMenu onClose={() => setShowProfile(false)} onNavigate={handleNavigation} />}
      />

      <div className="flex">
        {/* Reusable Sidebar */}
        <Sidebar
          variant="user"
          menuItems={USER_MENU_ITEMS}
          menuGroups={USER_MENU_GROUPS}
          activeItem={currentView}
          collapsed={sidebarCollapsed}
          onItemClick={handleNavigation}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          footerContent={sidebarFooter}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>

      {/* Reusable Mobile Drawer */}
      <MobileDrawer
        variant="user"
        isOpen={drawerOpen}
        user={user}
        menuItems={USER_MENU_ITEMS}
        menuGroups={USER_MENU_GROUPS}
        activeItem={currentView}
        isDarkMode={isDarkMode}
        onClose={() => setDrawerOpen(false)}
        onItemClick={handleNavigation}
        onToggleDarkMode={toggleDarkMode}
        onLogout={handleLogout}
      />
    </div>
  );
}
