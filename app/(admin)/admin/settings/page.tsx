'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Settings,
  Mail,
  Brain,
  Shield,
  Plug,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Globe,
  Lock,
  Key,
  Zap,
  Server,
  Clock,
  Users,
  CreditCard,
  ExternalLink,
  TestTube,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SettingSection {
  title: string;
  description: string;
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();

  // General settings state
  const [siteName, setSiteName] = useState('Haven Institute');
  const [siteDescription, setSiteDescription] = useState('The premier NCLEX preparation platform for nursing students.');
  const [siteUrl, setSiteUrl] = useState('https://haveninstitute.com');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [defaultUserRole, setDefaultUserRole] = useState('student');

  // Email settings state
  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('apikey');
  const [smtpPassword, setSmtpPassword] = useState('SG.xxxxxxxxxxxxxxxxxxxxx');
  const [fromEmail, setFromEmail] = useState('noreply@haveninstitute.com');
  const [fromName, setFromName] = useState('Haven Institute');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [emailWelcome, setEmailWelcome] = useState(true);
  const [emailWeeklyDigest, setEmailWeeklyDigest] = useState(true);
  const [emailStudyReminders, setEmailStudyReminders] = useState(true);
  const [emailMarketingOptIn, setEmailMarketingOptIn] = useState(false);

  // AI settings state
  const [aiProvider, setAiProvider] = useState('anthropic');
  const [aiApiKey, setAiApiKey] = useState('sk-ant-xxxxxxxxxxxxxxxxxxxxx');
  const [aiModel, setAiModel] = useState('claude-sonnet-4-20250514');
  const [showAiKey, setShowAiKey] = useState(false);
  const [aiExplanations, setAiExplanations] = useState(true);
  const [aiQuestionGeneration, setAiQuestionGeneration] = useState(true);
  const [aiStudyPlans, setAiStudyPlans] = useState(true);
  const [aiMaxTokens, setAiMaxTokens] = useState('4096');
  const [aiTemperature, setAiTemperature] = useState('0.7');

  // Security settings state
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [rateLimitRequests, setRateLimitRequests] = useState('100');
  const [rateLimitWindow, setRateLimitWindow] = useState('60');
  const [sessionDuration, setSessionDuration] = useState('72');
  const [mfaEnforced, setMfaEnforced] = useState(false);
  const [mfaAdminRequired, setMfaAdminRequired] = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [passwordRequireSpecial, setPasswordRequireSpecial] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState('5');
  const [lockoutDuration, setLockoutDuration] = useState('30');

  // Integration state
  const [stripeConnected] = useState(true);
  const [googleOAuthConnected] = useState(true);

  const maskKey = (key: string) => {
    if (key.length <= 8) return key;
    return key.substring(0, 7) + '...' + key.substring(key.length - 4);
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">System Settings</h1>
          </div>
          <p className="text-muted-foreground text-sm">Configure platform settings, integrations, and security policies.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="general" className="gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Brain className="h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Plug className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Site Configuration</CardTitle>
                <CardDescription>Basic platform settings and appearance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">Site URL</Label>
                    <Input id="siteUrl" value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Input id="siteDescription" value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultRole">Default User Role</Label>
                  <Select value={defaultUserRole} onValueChange={setDefaultUserRole}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Platform Controls</CardTitle>
                <CardDescription>Toggle platform-wide features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">Put the site in maintenance mode. Only admins can access.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {maintenanceMode && (
                      <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Open Registration</Label>
                    <p className="text-xs text-muted-foreground">Allow new users to register on the platform.</p>
                  </div>
                  <Switch checked={registrationOpen} onCheckedChange={setRegistrationOpen} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Email Settings */}
          <TabsContent value="email" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">SMTP Configuration</CardTitle>
                <CardDescription>Email server settings for transactional emails</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input id="smtpHost" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input id="smtpPort" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input id="smtpUser" value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <div className="relative">
                      <Input
                        id="smtpPassword"
                        type={showSmtpPassword ? 'text' : 'password'}
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                      >
                        {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input id="fromEmail" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input id="fromName" value={fromName} onChange={(e) => setFromName(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <TestTube className="h-4 w-4 mr-2" />
                    Send Test Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Email Templates</CardTitle>
                <CardDescription>Configure automated email notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Welcome Email</Label>
                    <p className="text-xs text-muted-foreground">Sent to new users upon registration</p>
                  </div>
                  <Switch checked={emailWelcome} onCheckedChange={setEmailWelcome} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Weekly Study Digest</Label>
                    <p className="text-xs text-muted-foreground">Weekly summary of study progress and recommendations</p>
                  </div>
                  <Switch checked={emailWeeklyDigest} onCheckedChange={setEmailWeeklyDigest} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Study Reminders</Label>
                    <p className="text-xs text-muted-foreground">Remind users when they haven&apos;t studied recently</p>
                  </div>
                  <Switch checked={emailStudyReminders} onCheckedChange={setEmailStudyReminders} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Marketing Opt-in Default</Label>
                    <p className="text-xs text-muted-foreground">Default marketing emails to opt-in for new users</p>
                  </div>
                  <Switch checked={emailMarketingOptIn} onCheckedChange={setEmailMarketingOptIn} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* AI Settings */}
          <TabsContent value="ai" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">AI Provider Configuration</CardTitle>
                <CardDescription>Configure the AI model used for explanations and question generation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>API Provider</Label>
                  <Select value={aiProvider} onValueChange={setAiProvider}>
                    <SelectTrigger className="w-[220px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                      <SelectItem value="google">Google (Gemini)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aiApiKey">API Key</Label>
                  <div className="relative">
                    <Input
                      id="aiApiKey"
                      type={showAiKey ? 'text' : 'password'}
                      value={aiApiKey}
                      onChange={(e) => setAiApiKey(e.target.value)}
                      className="pr-10 font-mono"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                      onClick={() => setShowAiKey(!showAiKey)}
                    >
                      {showAiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Current: {maskKey(aiApiKey)}</p>
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={aiModel} onValueChange={setAiModel}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProvider === 'anthropic' && (
                        <>
                          <SelectItem value="claude-sonnet-4-20250514">Claude Sonnet 4</SelectItem>
                          <SelectItem value="claude-opus-4-20250514">Claude Opus 4</SelectItem>
                          <SelectItem value="claude-haiku-35">Claude 3.5 Haiku</SelectItem>
                        </>
                      )}
                      {aiProvider === 'openai' && (
                        <>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        </>
                      )}
                      {aiProvider === 'google' && (
                        <>
                          <SelectItem value="gemini-2.0-flash">Gemini 2.0 Flash</SelectItem>
                          <SelectItem value="gemini-2.0-pro">Gemini 2.0 Pro</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="aiMaxTokens">Max Tokens</Label>
                    <Input id="aiMaxTokens" type="number" value={aiMaxTokens} onChange={(e) => setAiMaxTokens(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Maximum response length</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aiTemperature">Temperature</Label>
                    <Input id="aiTemperature" type="number" step="0.1" min="0" max="2" value={aiTemperature} onChange={(e) => setAiTemperature(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Response creativity (0 = focused, 2 = creative)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">AI Features</CardTitle>
                <CardDescription>Enable or disable AI-powered features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">AI Explanations</Label>
                    <p className="text-xs text-muted-foreground">Generate detailed explanations for question answers</p>
                  </div>
                  <Switch checked={aiExplanations} onCheckedChange={setAiExplanations} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">AI Question Generation</Label>
                    <p className="text-xs text-muted-foreground">Auto-generate practice questions from study materials</p>
                  </div>
                  <Switch checked={aiQuestionGeneration} onCheckedChange={setAiQuestionGeneration} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">AI Study Plans</Label>
                    <p className="text-xs text-muted-foreground">Personalized study plan recommendations</p>
                  </div>
                  <Switch checked={aiStudyPlans} onCheckedChange={setAiStudyPlans} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Rate Limiting</CardTitle>
                <CardDescription>Protect your API from abuse with rate limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enable Rate Limiting</Label>
                    <p className="text-xs text-muted-foreground">Limit the number of API requests per user</p>
                  </div>
                  <Switch checked={rateLimitEnabled} onCheckedChange={setRateLimitEnabled} />
                </div>
                {rateLimitEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid sm:grid-cols-2 gap-6"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="rateLimitRequests">Max Requests</Label>
                      <Input id="rateLimitRequests" type="number" value={rateLimitRequests} onChange={(e) => setRateLimitRequests(e.target.value)} />
                      <p className="text-xs text-muted-foreground">Maximum requests per window</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rateLimitWindow">Window (seconds)</Label>
                      <Input id="rateLimitWindow" type="number" value={rateLimitWindow} onChange={(e) => setRateLimitWindow(e.target.value)} />
                      <p className="text-xs text-muted-foreground">Time window for rate limiting</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Session & Authentication</CardTitle>
                <CardDescription>Configure session duration and authentication policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessionDuration">Session Duration (hours)</Label>
                    <Input id="sessionDuration" type="number" value={sessionDuration} onChange={(e) => setSessionDuration(e.target.value)} />
                    <p className="text-xs text-muted-foreground">How long user sessions remain active</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                    <Input id="loginAttempts" type="number" value={loginAttempts} onChange={(e) => setLoginAttempts(e.target.value)} />
                    <p className="text-xs text-muted-foreground">Before temporary account lockout</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                  <Input id="lockoutDuration" type="number" value={lockoutDuration} onChange={(e) => setLockoutDuration(e.target.value)} className="w-[200px]" />
                  <p className="text-xs text-muted-foreground">Duration of account lockout after max failed attempts</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Multi-Factor Authentication</CardTitle>
                <CardDescription>Enforce additional security for user accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enforce MFA for All Users</Label>
                    <p className="text-xs text-muted-foreground">Require all users to set up two-factor authentication</p>
                  </div>
                  <Switch checked={mfaEnforced} onCheckedChange={setMfaEnforced} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Require MFA for Admins</Label>
                    <p className="text-xs text-muted-foreground">Admin accounts must use two-factor authentication</p>
                  </div>
                  <Switch checked={mfaAdminRequired} onCheckedChange={setMfaAdminRequired} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Password Policy</CardTitle>
                <CardDescription>Set requirements for user passwords</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">Minimum Length</Label>
                    <Input id="passwordMinLength" type="number" value={passwordMinLength} onChange={(e) => setPasswordMinLength(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Require Special Characters</Label>
                    <p className="text-xs text-muted-foreground">Passwords must include at least one special character</p>
                  </div>
                  <Switch checked={passwordRequireSpecial} onCheckedChange={setPasswordRequireSpecial} />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            {/* Stripe */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">Stripe</h3>
                        <Badge variant="secondary" className={cn('text-xs', stripeConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600')}>
                          {stripeConnected ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Connected</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Disconnected</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Payment processing for subscriptions and one-time purchases.</p>
                      {stripeConnected && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Account ID</p>
                            <p className="font-mono text-xs">acct_1234567890</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">API Version</p>
                            <p className="font-mono text-xs">2025-12-18</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Webhook Status</p>
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-emerald-500" />
                              <span className="text-xs">Active (last event: 3 min ago)</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Mode</p>
                            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600">Production</Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {stripeConnected ? (
                      <>
                        <Button variant="outline" size="sm" className="gap-1">
                          Dashboard
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Google OAuth */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-amber-500 flex items-center justify-center shrink-0">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">Google OAuth</h3>
                        <Badge variant="secondary" className={cn('text-xs', googleOAuthConnected ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-500/10 text-red-600')}>
                          {googleOAuthConnected ? (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Connected</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Disconnected</>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">Allow users to sign in with their Google accounts.</p>
                      {googleOAuthConnected && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">Client ID</p>
                            <p className="font-mono text-xs truncate max-w-[200px]">123456789-abc...apps.googleusercontent.com</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Users via Google</p>
                            <p className="font-medium text-sm">4,231 (32.9%)</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Scopes</p>
                            <p className="text-xs">email, profile</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Redirect URI</p>
                            <p className="font-mono text-xs truncate max-w-[200px]">https://haveninstitute.com/api/auth/callback/google</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {googleOAuthConnected ? (
                      <>
                        <Button variant="outline" size="sm" className="gap-1">
                          Console
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="bg-gradient-to-r from-red-500 to-amber-500 text-white">
                        Connect
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for future integrations */}
            <Card className="border-0 shadow-sm border-dashed border-2">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                  <Plug className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Add More Integrations</h3>
                <p className="text-xs text-muted-foreground mb-4 max-w-sm">
                  Connect additional services like Slack notifications, Zapier automations, or custom webhooks.
                </p>
                <Button variant="outline" size="sm">
                  Browse Integrations
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
