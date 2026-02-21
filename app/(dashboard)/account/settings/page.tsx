'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/hooks';
import { useTheme } from 'next-themes';
import { PageHeader } from '@/components/shared/page-header';
import { CardSkeleton } from '@/components/shared/loading-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Settings,
  Bell,
  Shield,
  Eye,
  Moon,
  Sun,
  Globe,
  Clock,
  Lock,
  Smartphone,
  Mail,
  MessageSquare,
  BookOpen,
  Trash2,
  AlertTriangle,
  Save,
  Key,
  Monitor,
  Palette,
  Loader2,
  AlertCircle,
  Accessibility,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface SettingsData {
  theme: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  studyReminders: boolean;
  weeklyDigest: boolean;
  communityUpdates: boolean;
  achievementAlerts: boolean;
  profileVisibility: string;
  showProgress: boolean;
  showActivity: boolean;
  dataSharing?: boolean;
  dailyGoalQuestions: number;
  preferredDifficulty: string;
  showExplanations: boolean;
  enableTimer: boolean;
  fontSize: string;
  highContrast: boolean;
  reduceMotion: boolean;
}

const defaultSettings: SettingsData = {
  theme: 'system',
  language: 'en',
  timezone: 'America/New_York',
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  studyReminders: true,
  weeklyDigest: true,
  communityUpdates: true,
  achievementAlerts: true,
  profileVisibility: 'public',
  showProgress: true,
  showActivity: true,
  dataSharing: false,
  dailyGoalQuestions: 20,
  preferredDifficulty: 'adaptive',
  showExplanations: true,
  enableTimer: true,
  fontSize: 'medium',
  highContrast: false,
  reduceMotion: false,
};

export default function SettingsPage() {
  const { user } = useUser();
  const { setTheme: applyTheme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Delete account dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/account/settings');
      if (!res.ok) throw new Error('Failed to load settings');
      const json = await res.json();
      const data = json.data || json;

      setSettings({
        theme: data.theme || 'system',
        language: data.language || 'en',
        timezone: data.timezone || 'America/New_York',
        emailNotifications: data.emailNotifications ?? true,
        smsNotifications: data.smsNotifications ?? false,
        pushNotifications: data.pushNotifications ?? true,
        studyReminders: data.studyReminders ?? true,
        weeklyDigest: data.weeklyDigest ?? true,
        communityUpdates: data.communityUpdates ?? true,
        achievementAlerts: data.achievementAlerts ?? true,
        profileVisibility: data.profileVisibility || 'public',
        showProgress: data.showProgress ?? true,
        showActivity: data.showActivity ?? true,
        dataSharing: data.dataSharing ?? false,
        dailyGoalQuestions: data.dailyGoalQuestions ?? 20,
        preferredDifficulty: data.preferredDifficulty || 'adaptive',
        showExplanations: data.showExplanations ?? true,
        enableTimer: data.enableTimer ?? true,
        fontSize: data.fontSize || 'medium',
        highContrast: data.highContrast ?? false,
        reduceMotion: data.reduceMotion ?? false,
      });
      setMfaEnabled(data.mfaEnabled ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === 'theme') {
      applyTheme(value as string);
    }
  };

  const saveSection = async (section: string, data: Partial<SettingsData>) => {
    setSavingSection(section);
    try {
      const res = await fetch('/api/account/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to save settings');
      }
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSavingSection(null);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Failed to change password');
      }
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete account');
      toast.success('Account deleted. Redirecting...');
      window.location.href = '/';
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <PageHeader title="Settings" description="Manage your account preferences" />
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <PageHeader title="Settings" description="Manage your account preferences" />
        <EmptyState
          icon={AlertCircle}
          title="Failed to load settings"
          description={error}
        >
          <Button onClick={fetchSettings} variant="outline">Try Again</Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader title="Settings" description="Manage your account preferences" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full overflow-x-auto flex sm:inline-flex">
          <TabsTrigger value="general">
            <Settings className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy">
            <Eye className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="study">
            <GraduationCap className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />
            Study
          </TabsTrigger>
          <TabsTrigger value="accessibility">
            <Accessibility className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />
            Access
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-3.5 w-3.5 mr-1.5 hidden sm:block" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* ── General Tab ── */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Light', icon: Sun },
                      { value: 'dark', label: 'Dark', icon: Moon },
                      { value: 'system', label: 'System', icon: Monitor },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateSetting('theme', option.value)}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                          settings.theme === option.value
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-border/50 hover:border-border'
                        )}
                      >
                        <option.icon
                          className={cn(
                            'h-5 w-5',
                            settings.theme === option.value ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                        <span className="text-xs font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Globe className="h-4 w-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Language</p>
                      <p className="text-xs text-muted-foreground">Select your preferred language</p>
                    </div>
                  </div>
                  <Select value={settings.language} onValueChange={(v) => updateSetting('language', v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                      <SelectItem value="ko">Korean</SelectItem>
                      <SelectItem value="ja">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Timezone</p>
                      <p className="text-xs text-muted-foreground">For scheduling and reminders</p>
                    </div>
                  </div>
                  <Select value={settings.timezone} onValueChange={(v) => updateSetting('timezone', v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern (ET)</SelectItem>
                      <SelectItem value="America/Chicago">Central (CT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain (MT)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific (PT)</SelectItem>
                      <SelectItem value="America/Anchorage">Alaska (AKT)</SelectItem>
                      <SelectItem value="Pacific/Honolulu">Hawaii (HST)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-end">
            <Button
              onClick={() =>
                saveSection('general', {
                  theme: settings.theme,
                  language: settings.language,
                  timezone: settings.timezone,
                })
              }
              disabled={savingSection === 'general'}
            >
              {savingSection === 'general' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </TabsContent>

        {/* ── Notifications Tab ── */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                {[
                  {
                    label: 'Email Notifications',
                    desc: 'Receive updates and alerts via email',
                    icon: Mail,
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                    key: 'emailNotifications' as const,
                  },
                  {
                    label: 'SMS Notifications',
                    desc: 'Receive text message alerts',
                    icon: MessageCircle,
                    color: 'text-teal-500',
                    bg: 'bg-teal-500/10',
                    key: 'smsNotifications' as const,
                  },
                  {
                    label: 'Push Notifications',
                    desc: 'Get notified on your device in real-time',
                    icon: Smartphone,
                    color: 'text-purple-500',
                    bg: 'bg-purple-500/10',
                    key: 'pushNotifications' as const,
                  },
                  {
                    label: 'Study Reminders',
                    desc: 'Daily reminders to keep your study streak alive',
                    icon: BookOpen,
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    key: 'studyReminders' as const,
                  },
                  {
                    label: 'Weekly Digest',
                    desc: 'Summary of your weekly progress and achievements',
                    icon: Mail,
                    color: 'text-amber-500',
                    bg: 'bg-amber-500/10',
                    key: 'weeklyDigest' as const,
                  },
                  {
                    label: 'Community Updates',
                    desc: 'Notifications for replies, mentions, and group activity',
                    icon: MessageSquare,
                    color: 'text-pink-500',
                    bg: 'bg-pink-500/10',
                    key: 'communityUpdates' as const,
                  },
                  {
                    label: 'Achievement Alerts',
                    desc: 'Get notified when you unlock badges or reach milestones',
                    icon: Bell,
                    color: 'text-orange-500',
                    bg: 'bg-orange-500/10',
                    key: 'achievementAlerts' as const,
                  },
                ].map((item, i, arr) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between py-4 px-2 rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={cn('h-9 w-9 rounded-lg flex items-center justify-center', item.bg)}>
                          <item.icon className={cn('h-4 w-4', item.color)} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <Switch
                        checked={settings[item.key] as boolean}
                        onCheckedChange={(v) => updateSetting(item.key, v)}
                      />
                    </div>
                    {i < arr.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-end">
            <Button
              onClick={() =>
                saveSection('notifications', {
                  emailNotifications: settings.emailNotifications,
                  smsNotifications: settings.smsNotifications,
                  pushNotifications: settings.pushNotifications,
                  studyReminders: settings.studyReminders,
                  weeklyDigest: settings.weeklyDigest,
                  communityUpdates: settings.communityUpdates,
                  achievementAlerts: settings.achievementAlerts,
                })
              }
              disabled={savingSection === 'notifications'}
            >
              {savingSection === 'notifications' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* ── Privacy Tab ── */}
        <TabsContent value="privacy" className="space-y-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">Profile Visibility</p>
                    <p className="text-xs text-muted-foreground">Control who can view your profile</p>
                  </div>
                  <Select
                    value={settings.profileVisibility}
                    onValueChange={(v) => updateSetting('profileVisibility', v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="friends">Friends</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                {[
                  {
                    label: 'Show Progress',
                    desc: 'Display your study progress on your public profile',
                    key: 'showProgress' as const,
                  },
                  {
                    label: 'Activity Visibility',
                    desc: 'Let others see your recent study activity',
                    key: 'showActivity' as const,
                  },
                  {
                    label: 'Data Sharing',
                    desc: 'Share anonymized data to help improve the platform',
                    key: 'dataSharing' as const,
                  },
                ].map((item, i, arr) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={settings[item.key] as boolean}
                        onCheckedChange={(v) => updateSetting(item.key, v)}
                      />
                    </div>
                    {i < arr.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-end">
            <Button
              onClick={() =>
                saveSection('privacy', {
                  profileVisibility: settings.profileVisibility,
                  showProgress: settings.showProgress,
                  showActivity: settings.showActivity,
                })
              }
              disabled={savingSection === 'privacy'}
            >
              {savingSection === 'privacy' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Privacy Settings
            </Button>
          </div>
        </TabsContent>

        {/* ── Study Tab ── */}
        <TabsContent value="study" className="space-y-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Study Preferences
                </CardTitle>
                <CardDescription>Customize your study experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Daily Goal (Questions)</p>
                    <p className="text-xs text-muted-foreground">Number of questions to aim for each day</p>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={200}
                    value={settings.dailyGoalQuestions}
                    onChange={(e) => updateSetting('dailyGoalQuestions', parseInt(e.target.value, 10) || 20)}
                    className="w-24 text-center"
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Preferred Difficulty</p>
                    <p className="text-xs text-muted-foreground">Default difficulty for practice sessions</p>
                  </div>
                  <Select
                    value={settings.preferredDifficulty}
                    onValueChange={(v) => updateSetting('preferredDifficulty', v)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="adaptive">Adaptive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Show Explanations</p>
                    <p className="text-xs text-muted-foreground">Show answer explanations after each question</p>
                  </div>
                  <Switch
                    checked={settings.showExplanations}
                    onCheckedChange={(v) => updateSetting('showExplanations', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Enable Timer</p>
                    <p className="text-xs text-muted-foreground">Show countdown timer during practice sessions</p>
                  </div>
                  <Switch
                    checked={settings.enableTimer}
                    onCheckedChange={(v) => updateSetting('enableTimer', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-end">
            <Button
              onClick={() =>
                saveSection('study', {
                  dailyGoalQuestions: settings.dailyGoalQuestions,
                  preferredDifficulty: settings.preferredDifficulty,
                  showExplanations: settings.showExplanations,
                  enableTimer: settings.enableTimer,
                })
              }
              disabled={savingSection === 'study'}
            >
              {savingSection === 'study' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Study Settings
            </Button>
          </div>
        </TabsContent>

        {/* ── Accessibility Tab ── */}
        <TabsContent value="accessibility" className="space-y-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Accessibility className="h-4 w-4 text-primary" />
                  Accessibility
                </CardTitle>
                <CardDescription>Adjust the app for your accessibility needs</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Font Size</p>
                    <p className="text-xs text-muted-foreground">Adjust the text size across the app</p>
                  </div>
                  <Select
                    value={settings.fontSize}
                    onValueChange={(v) => updateSetting('fontSize', v)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="x-large">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">High Contrast</p>
                    <p className="text-xs text-muted-foreground">Increase contrast for better visibility</p>
                  </div>
                  <Switch
                    checked={settings.highContrast}
                    onCheckedChange={(v) => updateSetting('highContrast', v)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Reduce Motion</p>
                    <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
                  </div>
                  <Switch
                    checked={settings.reduceMotion}
                    onCheckedChange={(v) => updateSetting('reduceMotion', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-end">
            <Button
              onClick={() =>
                saveSection('accessibility', {
                  fontSize: settings.fontSize,
                  highContrast: settings.highContrast,
                  reduceMotion: settings.reduceMotion,
                })
              }
              disabled={savingSection === 'accessibility'}
            >
              {savingSection === 'accessibility' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Accessibility Settings
            </Button>
          </div>
        </TabsContent>

        {/* ── Security Tab ── */}
        <TabsContent value="security" className="space-y-6 mt-6">
          {/* MFA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center',
                        mfaEnabled ? 'bg-emerald-500/10' : 'bg-muted'
                      )}
                    >
                      <Smartphone
                        className={cn('h-5 w-5', mfaEnabled ? 'text-emerald-500' : 'text-muted-foreground')}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Authenticator App</p>
                      <p className="text-xs text-muted-foreground">
                        {mfaEnabled ? 'Two-factor authentication is active' : 'Not configured yet'}
                      </p>
                    </div>
                  </div>
                  <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Change Password */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-4 w-4 text-primary" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and numbers.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                >
                  {changingPassword ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Active Sessions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Active Sessions</CardTitle>
                <CardDescription>Devices currently logged in to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        Current Browser
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-medium text-emerald-600">
                          Current
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">This device - Active now</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible actions on your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                  <div>
                    <p className="text-sm font-medium">Delete Account</p>
                    <p className="text-xs text-muted-foreground">
                      Permanently delete your account and all associated data. This cannot be undone.
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data, progress, and achievements will be
              permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">
              Type <strong>DELETE</strong> to confirm:
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'DELETE' || isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
