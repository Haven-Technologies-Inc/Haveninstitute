'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from './logo';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Brain,
  BookOpen,
  Layers,
  MessageSquare,
  TrendingUp,
  BarChart3,
  CalendarDays,
  Users,
  MessageCircle,
  Settings,
  CreditCard,
  User,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Sparkles,
  Trophy,
} from 'lucide-react';

const navItems = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Practice',
    items: [
      { href: '/practice', icon: Brain, label: 'Practice Hub' },
      { href: '/practice/quiz', icon: GraduationCap, label: 'Quiz Mode' },
      { href: '/practice/cat', icon: Trophy, label: 'CAT Simulator' },
      { href: '/practice/nclex', icon: Sparkles, label: 'NCLEX Exam' },
    ],
  },
  {
    label: 'Study',
    items: [
      { href: '/study/flashcards', icon: Layers, label: 'Flashcards' },
      { href: '/study/books', icon: BookOpen, label: 'Library' },
      { href: '/study/ai-chat', icon: MessageSquare, label: 'AI Tutor' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { href: '/progress', icon: TrendingUp, label: 'Overview' },
      { href: '/progress/analytics', icon: BarChart3, label: 'Analytics' },
      { href: '/progress/achievements', icon: Trophy, label: 'Achievements' },
      { href: '/progress/planner', icon: CalendarDays, label: 'Study Planner' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/community/groups', icon: Users, label: 'Study Groups' },
      { href: '/community/discussions', icon: MessageCircle, label: 'Discussions' },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/account/profile', icon: User, label: 'Profile' },
      { href: '/account/settings', icon: Settings, label: 'Settings' },
      { href: '/account/subscription', icon: CreditCard, label: 'Subscription' },
    ],
  },
];

interface SidebarProps {
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ className, mobileOpen, onMobileClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={cn(
          'fixed lg:relative flex flex-col h-screen border-r border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 z-50',
          'lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          collapsed ? 'w-[68px]' : 'w-[260px]',
          className
        )}
      >
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-border/50', collapsed && 'justify-center')}>
        <Logo size="sm" showText={!collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navItems.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      collapsed && 'justify-center px-2'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className={cn('shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle - hidden on mobile */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background shadow-sm hover:bg-muted z-10 hidden lg:flex"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>
    </aside>
    </>
  );
}
