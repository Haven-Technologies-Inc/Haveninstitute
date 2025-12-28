/**
 * System Settings Page
 * 
 * Admin dashboard page for configuring all system settings:
 * - Stripe (payments)
 * - OAuth (Google, etc.)
 * - Email (SMTP)
 * - Feature Flags
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import {
  CreditCard,
  Mail,
  Shield,
  Settings,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Globe,
  Zap,
} from 'lucide-react';
import { StripeSettings } from './StripeSettings';
import { systemSettingsApi, SystemSetting, SettingUpdate } from '../../services/api/systemSettingsApi';

// OAuth Settings Component
function OAuthSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useState(() => {
    loadSettings();
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemSettingsApi.getOAuthSettings();
      setSettings(data);
      
      const initialData: Record<string, string> = {};
      data.forEach(s => {
        if (!s.isSecret && s.value) {
          initialData[s.key] = s.value;
        }
      });
      setFormData(initialData);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load OAuth settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const updates: SettingUpdate[] = Object.entries(formData)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => ({ key, value }));
      
      await systemSettingsApi.updateOAuthSettings(updates);
      setSuccess(true);
      await loadSettings();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save OAuth settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <XCircle className="size-5 text-red-600" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">OAuth settings saved!</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="size-5" />
          Google OAuth
        </h3>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Client ID</Label>
              {settings.find(s => s.key === 'google_client_id')?.isConfigured && (
                <Badge className="bg-green-100 text-green-800 text-xs">Configured</Badge>
              )}
            </div>
            <Input
              placeholder="your-client-id.apps.googleusercontent.com"
              value={formData['google_client_id'] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, 'google_client_id': e.target.value }))}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Client Secret</Label>
              {settings.find(s => s.key === 'google_client_secret')?.isConfigured && (
                <Badge className="bg-green-100 text-green-800 text-xs">Configured</Badge>
              )}
            </div>
            <div className="relative">
              <Input
                type={showSecrets['google_client_secret'] ? 'text' : 'password'}
                placeholder={settings.find(s => s.key === 'google_client_secret')?.isConfigured ? '••••••••' : 'GOCSPX-...'}
                value={formData['google_client_secret'] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, 'google_client_secret': e.target.value }))}
                className="font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecrets(prev => ({ ...prev, 'google_client_secret': !prev['google_client_secret'] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showSecrets['google_client_secret'] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Setup Instructions</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                <li>Create a new project or select existing</li>
                <li>Enable Google+ API</li>
                <li>Go to Credentials → Create OAuth Client ID</li>
                <li>Add authorized redirect URI: <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">https://yourdomain.com/api/v1/oauth/google/callback</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
        {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
        {saving ? 'Saving...' : 'Save OAuth Settings'}
      </Button>
    </div>
  );
}

// Email Settings Component
function EmailSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  useState(() => {
    loadSettings();
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemSettingsApi.getEmailSettings();
      setSettings(data);
      
      const initialData: Record<string, string> = {};
      data.forEach(s => {
        if (!s.isSecret && s.value) {
          initialData[s.key] = s.value;
        }
      });
      setFormData(initialData);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      const updates: SettingUpdate[] = Object.entries(formData)
        .filter(([_, value]) => value !== '')
        .map(([key, value]) => ({ key, value }));
      
      await systemSettingsApi.updateEmailSettings(updates);
      setSuccess(true);
      await loadSettings();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save email settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <XCircle className="size-5 text-red-600" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">Email settings saved!</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>SMTP Host</Label>
          <Input
            placeholder="smtp.gmail.com"
            value={formData['smtp_host'] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, 'smtp_host': e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>SMTP Port</Label>
          <Input
            placeholder="587"
            value={formData['smtp_port'] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, 'smtp_port': e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label>SMTP Username</Label>
          <Input
            placeholder="your-email@gmail.com"
            value={formData['smtp_user'] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, 'smtp_user': e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>SMTP Password</Label>
            {settings.find(s => s.key === 'smtp_password')?.isConfigured && (
              <Badge className="bg-green-100 text-green-800 text-xs">Configured</Badge>
            )}
          </div>
          <div className="relative">
            <Input
              type={showSecrets['smtp_password'] ? 'text' : 'password'}
              placeholder={settings.find(s => s.key === 'smtp_password')?.isConfigured ? '••••••••' : 'App password'}
              value={formData['smtp_password'] || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, 'smtp_password': e.target.value }))}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowSecrets(prev => ({ ...prev, 'smtp_password': !prev['smtp_password'] }))}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showSecrets['smtp_password'] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>From Email Address</Label>
          <Input
            placeholder="noreply@yourdomain.com"
            value={formData['email_from'] || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, 'email_from': e.target.value }))}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-600 to-purple-600">
        {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
        {saving ? 'Saving...' : 'Save Email Settings'}
      </Button>
    </div>
  );
}

// Feature Flags Component
function FeatureFlags() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  useState(() => {
    loadSettings();
  });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await systemSettingsApi.getFeatureFlags();
      setSettings(data);
      
      const initialFlags: Record<string, boolean> = {};
      data.forEach(s => {
        initialFlags[s.key] = s.value === 'true';
      });
      setFlags(initialFlags);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, value: boolean) => {
    setFlags(prev => ({ ...prev, [key]: value }));
    
    try {
      await systemSettingsApi.updateSetting(key, value ? 'true' : 'false');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to update feature flag');
      setFlags(prev => ({ ...prev, [key]: !value }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const featureDescriptions: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
    'enable_payments': {
      title: 'Payment Processing',
      description: 'Enable Stripe payment processing for subscriptions',
      icon: <CreditCard className="size-5" />,
    },
    'enable_ai_chat': {
      title: 'AI Chat',
      description: 'Enable AI-powered tutoring and chat features',
      icon: <Zap className="size-5" />,
    },
    'enable_email': {
      title: 'Email Notifications',
      description: 'Enable sending email notifications to users',
      icon: <Mail className="size-5" />,
    },
    'maintenance_mode': {
      title: 'Maintenance Mode',
      description: 'Put the application in maintenance mode (users cannot access)',
      icon: <Settings className="size-5" />,
    },
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <XCircle className="size-5 text-red-600" />
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="size-5 text-green-600" />
          <p className="text-sm text-green-800 dark:text-green-200">Feature flag updated!</p>
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(featureDescriptions).map(([key, { title, description, icon }]) => (
          <div key={key} className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${flags[key] ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                {icon}
              </div>
              <div>
                <h4 className="font-medium">{title}</h4>
                <p className="text-sm text-gray-500">{description}</p>
              </div>
            </div>
            <Switch
              checked={flags[key] || false}
              onCheckedChange={(checked) => handleToggle(key, checked)}
            />
          </div>
        ))}
      </div>

      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-start gap-3">
          <AlertCircle className="size-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <p className="font-semibold">Warning</p>
            <p>Enabling maintenance mode will prevent all users from accessing the application. Use with caution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main System Settings Component
export function SystemSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure API keys, integrations, and feature flags</p>
      </div>

      <Tabs defaultValue="stripe" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 dark:bg-gray-800">
          <TabsTrigger value="stripe" className="dark:data-[state=active]:bg-gray-700">
            <CreditCard className="size-4 mr-2" />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="oauth" className="dark:data-[state=active]:bg-gray-700">
            <Shield className="size-4 mr-2" />
            OAuth
          </TabsTrigger>
          <TabsTrigger value="email" className="dark:data-[state=active]:bg-gray-700">
            <Mail className="size-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="features" className="dark:data-[state=active]:bg-gray-700">
            <Zap className="size-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe">
          <StripeSettings />
        </TabsContent>

        <TabsContent value="oauth">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Shield className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>OAuth Configuration</CardTitle>
                  <CardDescription>Configure social login providers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <OAuthSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Mail className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>Configure SMTP settings for sending emails</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <EmailSettings />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Zap className="size-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Feature Flags</CardTitle>
                  <CardDescription>Enable or disable application features</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <FeatureFlags />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default SystemSettings;
