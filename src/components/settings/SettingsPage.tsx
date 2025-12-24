import { useState } from 'react';
import { 
  User, 
  Bell, 
  Monitor, 
  Shield, 
  CreditCard, 
  Lock,
  Smartphone,
  Download,
  Trash2,
  ChevronRight,
  Moon,
  Sun,
  Volume2,
  Eye,
  Globe,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  useSettings, 
  useUpdateNotifications,
  useUpdateStudyPreferences,
  useUpdateDisplayPreferences,
  useUpdatePrivacySettings,
  useSessions,
  useRevokeSession
} from '../../services/hooks/useSettings';
import { useCurrentSubscription } from '../../services/hooks/useSubscription';

type SettingsSection = 'profile' | 'notifications' | 'study' | 'display' | 'privacy' | 'security' | 'subscription';

const settingsSections = [
  { id: 'profile' as const, label: 'Profile', icon: User, description: 'Manage your account details' },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell, description: 'Control how we contact you' },
  { id: 'study' as const, label: 'Study Preferences', icon: Clock, description: 'Customize your study experience' },
  { id: 'display' as const, label: 'Display', icon: Monitor, description: 'Appearance and accessibility' },
  { id: 'privacy' as const, label: 'Privacy', icon: Eye, description: 'Manage your privacy settings' },
  { id: 'security' as const, label: 'Security', icon: Shield, description: 'Password and authentication' },
  { id: 'subscription' as const, label: 'Subscription', icon: CreditCard, description: 'Billing and plan details' },
];

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const { data: settings, isLoading } = useSettings();
  const { data: subscription } = useCurrentSubscription();
  const { data: sessions } = useSessions();

  const updateNotifications = useUpdateNotifications();
  const updateStudyPrefs = useUpdateStudyPreferences();
  const updateDisplayPrefs = useUpdateDisplayPreferences();
  const updatePrivacy = useUpdatePrivacySettings();
  const revokeSession = useRevokeSession();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
              <div className="space-y-4">
                {Object.entries(settings?.notificationPreferences?.email || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                    <button
                      onClick={() => updateNotifications.mutate({ 
                        email: { ...settings?.notificationPreferences?.email, [key]: !value } 
                      })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Push Notifications</h3>
              <div className="space-y-4">
                {Object.entries(settings?.notificationPreferences?.push || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                    </div>
                    <button
                      onClick={() => updateNotifications.mutate({ 
                        push: { ...settings?.notificationPreferences?.push, [key]: !value } 
                      })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        value ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        value ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'study':
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium mb-2">Daily Study Goal (minutes)</label>
                <select
                  value={settings?.studyPreferences?.dailyGoal || 60}
                  onChange={(e) => updateStudyPrefs.mutate({ dailyGoal: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium mb-2">Preferred Study Time</label>
                <select
                  value={settings?.studyPreferences?.preferredStudyTime || 'morning'}
                  onChange={(e) => updateStudyPrefs.mutate({ 
                    preferredStudyTime: e.target.value as any 
                  })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <label className="block text-sm font-medium mb-2">Questions Per Session</label>
                <select
                  value={settings?.studyPreferences?.questionsPerSession || 20}
                  onChange={(e) => updateStudyPrefs.mutate({ 
                    questionsPerSession: parseInt(e.target.value) 
                  })}
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value={10}>10 questions</option>
                  <option value={20}>20 questions</option>
                  <option value={30}>30 questions</option>
                  <option value={50}>50 questions</option>
                </select>
              </div>

              {[
                { key: 'showExplanationsImmediately', label: 'Show explanations immediately' },
                { key: 'autoAdvanceQuestions', label: 'Auto-advance to next question' },
                { key: 'soundEffects', label: 'Sound effects' },
                { key: 'hapticFeedback', label: 'Haptic feedback' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="font-medium">{label}</span>
                  <button
                    onClick={() => updateStudyPrefs.mutate({ 
                      [key]: !settings?.studyPreferences?.[key as keyof typeof settings.studyPreferences] 
                    })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings?.studyPreferences?.[key as keyof typeof settings.studyPreferences] 
                        ? 'bg-indigo-600' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings?.studyPreferences?.[key as keyof typeof settings.studyPreferences] 
                        ? 'translate-x-7' 
                        : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case 'display':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="block text-sm font-medium mb-3">Theme</label>
              <div className="flex gap-3">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateDisplayPrefs.mutate({ theme: theme as any })}
                    className={`flex-1 p-3 rounded-lg border-2 flex flex-col items-center gap-2 ${
                      settings?.displayPreferences?.theme === theme
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {theme === 'light' && <Sun className="w-5 h-5" />}
                    {theme === 'dark' && <Moon className="w-5 h-5" />}
                    {theme === 'system' && <Monitor className="w-5 h-5" />}
                    <span className="capitalize text-sm">{theme}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="block text-sm font-medium mb-2">Font Size</label>
              <select
                value={settings?.displayPreferences?.fontSize || 'medium'}
                onChange={(e) => updateDisplayPrefs.mutate({ fontSize: e.target.value as any })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={settings?.displayPreferences?.language || 'en'}
                onChange={(e) => updateDisplayPrefs.mutate({ language: e.target.value })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>

            {[
              { key: 'highContrast', label: 'High contrast mode' },
              { key: 'reducedMotion', label: 'Reduced motion' },
              { key: 'compactMode', label: 'Compact mode' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">{label}</span>
                <button
                  onClick={() => updateDisplayPrefs.mutate({ 
                    [key]: !settings?.displayPreferences?.[key as keyof typeof settings.displayPreferences] 
                  })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings?.displayPreferences?.[key as keyof typeof settings.displayPreferences] 
                      ? 'bg-indigo-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings?.displayPreferences?.[key as keyof typeof settings.displayPreferences] 
                      ? 'translate-x-7' 
                      : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="block text-sm font-medium mb-2">Profile Visibility</label>
              <select
                value={settings?.privacySettings?.profileVisibility || 'friends'}
                onChange={(e) => updatePrivacy.mutate({ profileVisibility: e.target.value as any })}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            {[
              { key: 'showProgressOnLeaderboard', label: 'Show progress on leaderboard' },
              { key: 'allowStudyGroupInvites', label: 'Allow study group invites' },
              { key: 'shareActivityWithFriends', label: 'Share activity with friends' },
              { key: 'allowDirectMessages', label: 'Allow direct messages' },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">{label}</span>
                <button
                  onClick={() => updatePrivacy.mutate({ 
                    [key]: !settings?.privacySettings?.[key as keyof typeof settings.privacySettings] 
                  })}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings?.privacySettings?.[key as keyof typeof settings.privacySettings] 
                      ? 'bg-indigo-600' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings?.privacySettings?.[key as keyof typeof settings.privacySettings] 
                      ? 'translate-x-7' 
                      : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline">Change Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Two-Factor Authentication
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant={settings?.twoFactorEnabled ? 'default' : 'secondary'}>
                      {settings?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <Button variant={settings?.twoFactorEnabled ? 'destructive' : 'default'}>
                    {settings?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage devices where you're logged in</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions?.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{session.deviceInfo || 'Unknown Device'}</p>
                        <p className="text-xs text-gray-500">
                          Last active: {new Date(session.lastActive).toLocaleDateString()}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => revokeSession.mutate(session.id)}
                      >
                        Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <Trash2 className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Export Data</p>
                    <p className="text-sm text-gray-500">Download all your data</p>
                  </div>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-600">Delete Account</p>
                    <p className="text-sm text-gray-500">Permanently delete your account</p>
                  </div>
                  <Button variant="destructive">Delete</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="mb-2">{subscription?.planType || 'Free'}</Badge>
                    <h3 className="text-xl font-bold">
                      {subscription?.planType === 'Free' ? 'Free Plan' : `${subscription?.planType} Plan`}
                    </h3>
                    {subscription?.currentPeriodEnd && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subscription.cancelAtPeriodEnd 
                          ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                          : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                        }
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {subscription?.planType !== 'Free' && (
                      <p className="text-2xl font-bold">
                        ${subscription?.amount}/{subscription?.billingPeriod === 'yearly' ? 'yr' : 'mo'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plan Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {subscription?.features && Object.entries(subscription.features).map(([key, value]) => (
                    <li key={key} className="flex items-center gap-2 text-sm">
                      <span className={value === true || (typeof value === 'number' && value !== 0) 
                        ? 'text-green-500' 
                        : 'text-gray-400'
                      }>
                        {value === true || (typeof value === 'number' && value !== 0) ? '✓' : '✗'}
                      </span>
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      {typeof value === 'number' && value > 0 && (
                        <span className="text-gray-500">
                          ({value === -1 ? 'Unlimited' : value})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              {subscription?.planType === 'Free' ? (
                <Button className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                  Upgrade Plan
                </Button>
              ) : (
                <>
                  <Button variant="outline" className="flex-1">
                    Change Plan
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Manage Billing
                  </Button>
                </>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12 text-gray-500">
            Select a section from the sidebar
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingsSections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <p className="font-medium">{section.label}</p>
                    <p className="text-xs text-gray-500 hidden xl:block">{section.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {settingsSections.find(s => s.id === activeSection)?.label}
              </CardTitle>
              <CardDescription>
                {settingsSections.find(s => s.id === activeSection)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderSection()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
