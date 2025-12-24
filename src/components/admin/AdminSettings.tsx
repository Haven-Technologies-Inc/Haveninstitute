import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Settings, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Palette,
  Globe,
  Save,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Brain,
  Sparkles,
  Zap,
  RefreshCw,
  Copy,
  Download,
  RotateCcw,
  Activity
} from 'lucide-react';
import { 
  getSMTPConfig, 
  updateSMTPConfig, 
  testSMTPConnection,
  fetchSMTPConfig,
  type SMTPConfig 
} from '../../services/zohoMailApi';
import { adminApi } from '../../services/adminApi';
import {
  getAllAIIntegrations,
  saveAIIntegration,
  testOpenAIConnection,
  testDeepSeekConnection,
  validateAPIKey,
  exportAIConfiguration,
  resetAIIntegration,
  getAIUsageStats,
  type OpenAIConfig,
  type DeepSeekConfig
} from '../../services/aiIntegrationApi';
import { toast } from 'sonner';

export function AdminSettings() {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showStripeSecret, setShowStripeSecret] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [emailServiceStatus, setEmailServiceStatus] = useState<'unknown' | 'connected' | 'disconnected'>('unknown');
  
  // SMTP Configuration
  const [smtpConfig, setSMTPConfig] = useState<SMTPConfig>({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    username: '',
    password: '',
    fromEmail: 'noreply@nursehaven.com',
    fromName: 'NurseHaven'
  });
  
  // Stripe Configuration
  const [stripeConfig, setStripeConfig] = useState({
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    testMode: true
  });

  // AI Integration Configuration
  const [openAIConfig, setOpenAIConfig] = useState<OpenAIConfig>({
    id: 'openai',
    name: 'OpenAI',
    enabled: false,
    apiKey: '',
    apiUrl: 'https://api.openai.com/v1',
    model: 'gpt-4-turbo',
    maxTokens: 2000,
    temperature: 0.7,
    organizationId: '',
    status: 'inactive'
  });

  const [deepSeekConfig, setDeepSeekConfig] = useState<DeepSeekConfig>({
    id: 'deepseek',
    name: 'DeepSeek AI',
    enabled: false,
    apiKey: '',
    apiUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-chat',
    maxTokens: 4000,
    temperature: 0.7,
    status: 'inactive'
  });

  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showDeepSeekKey, setShowDeepSeekKey] = useState(false);

  useEffect(() => {
    // Load saved configurations
    const loadConfig = async () => {
      // Try to fetch from backend first
      try {
        const backendConfig = await fetchSMTPConfig();
        if (backendConfig) {
          setSMTPConfig(prev => ({ ...prev, ...backendConfig }));
        }
      } catch {
        // Fall back to local storage
        const savedSMTP = getSMTPConfig();
        setSMTPConfig(savedSMTP);
      }
    };
    loadConfig();
    
    const savedStripe = localStorage.getItem('stripe_config');
    if (savedStripe) {
      setStripeConfig(JSON.parse(savedStripe));
    }

    // Load AI integrations
    const savedAI = getAllAIIntegrations();
    if (savedAI.openai) {
      setOpenAIConfig(savedAI.openai);
    }
    if (savedAI.deepseek) {
      setDeepSeekConfig(savedAI.deepseek);
    }
  }, []);

  const handleSaveSMTP = async () => {
    setLoading(true);
    try {
      const result = await updateSMTPConfig(smtpConfig);
      if (result.success) {
        toast.success(result.message || 'Zoho SMTP configuration saved successfully');
      } else {
        toast.error(result.message || 'Failed to save SMTP configuration');
      }
    } catch (error) {
      toast.error('Failed to save SMTP configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMTP = async () => {
    setTesting(true);
    try {
      const result = await testSMTPConnection(smtpConfig);
      if (result.success) {
        toast.success(result.message);
        setEmailServiceStatus('connected');
      } else {
        toast.error(result.message);
        setEmailServiceStatus('disconnected');
      }
    } catch (error) {
      toast.error('Failed to test SMTP connection');
      setEmailServiceStatus('disconnected');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setSendingTestEmail(true);
    try {
      const result = await adminApi.sendTestEmail(testEmailAddress);
      if (result.success) {
        toast.success(result.message || `Test email sent to ${testEmailAddress}`);
        setTestEmailAddress('');
      } else {
        toast.error('Failed to send test email');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send test email. Check SMTP configuration.');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleSaveStripe = () => {
    try {
      localStorage.setItem('stripe_config', JSON.stringify(stripeConfig));
      toast.success('Stripe configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save Stripe configuration');
    }
  };

  const handleSaveAIIntegration = async () => {
    setLoading(true);
    try {
      saveAIIntegration('openai', openAIConfig);
      saveAIIntegration('deepseek', deepSeekConfig);
      toast.success('AI integration configuration saved successfully');
    } catch (error) {
      toast.error('Failed to save AI integration configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleTestOpenAIConnection = async () => {
    setTesting(true);
    try {
      const result = await testOpenAIConnection(openAIConfig);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to test OpenAI connection');
    } finally {
      setTesting(false);
    }
  };

  const handleTestDeepSeekConnection = async () => {
    setTesting(true);
    try {
      const result = await testDeepSeekConnection(deepSeekConfig);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to test DeepSeek connection');
    } finally {
      setTesting(false);
    }
  };

  const handleValidateAPIKey = async (provider: 'openai' | 'deepseek', apiKey: string) => {
    setTesting(true);
    try {
      const result = validateAPIKey(provider, apiKey);
      if (result.valid) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to validate API key');
    } finally {
      setTesting(false);
    }
  };

  const handleExportAIConfiguration = () => {
    try {
      const config = exportAIConfiguration();
      const blob = new Blob([config], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai_configuration.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('AI configuration exported successfully');
    } catch (error) {
      toast.error('Failed to export AI configuration');
    }
  };

  const handleResetAIIntegration = () => {
    try {
      resetAIIntegration('openai');
      resetAIIntegration('deepseek');
      const defaults = getAllAIIntegrations();
      setOpenAIConfig(defaults.openai);
      setDeepSeekConfig(defaults.deepseek);
      toast.success('AI integration reset successfully');
    } catch (error) {
      toast.error('Failed to reset AI integration');
    }
  };

  const handleGetAIUsageStats = () => {
    try {
      const stats = getAIUsageStats();
      toast.success(`AI usage stats: ${JSON.stringify(stats)}`);
    } catch (error) {
      toast.error('Failed to get AI usage stats');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl text-gray-900 dark:text-white mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-gray-400">Configure system preferences and options</p>
      </div>

      {/* General Settings */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="size-5 text-blue-600" />
            <CardTitle className="dark:text-white">General Settings</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">Basic platform configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Platform Name</label>
            <Input defaultValue="NurseHaven" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Tagline</label>
            <Input defaultValue="Your Safe Haven for NCLEX Success" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Support Email</label>
            <Input type="email" defaultValue="support@nursehaven.com" className="dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          </div>
          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Platform Description</label>
            <Textarea 
              rows={3}
              defaultValue="AI-powered NCLEX preparation platform with Computer Adaptive Testing, personalized study plans, and comprehensive analytics."
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
          </div>
          <Button>
            <Save className="size-4 mr-2" />
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Zoho Mail SMTP Settings */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="size-5 text-purple-600" />
            <CardTitle className="dark:text-white">Zoho Mail SMTP Configuration</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">Configure Zoho Mail SMTP for sending emails</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block">SMTP Host</label>
              <Input 
                value={smtpConfig.host}
                onChange={(e) => setSMTPConfig({ ...smtpConfig, host: e.target.value })}
                placeholder="smtp.zoho.com"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block">SMTP Port</label>
              <Input 
                type="number"
                value={smtpConfig.port}
                onChange={(e) => setSMTPConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                placeholder="465"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block">Username / Email</label>
              <Input 
                value={smtpConfig.username}
                onChange={(e) => setSMTPConfig({ ...smtpConfig, username: e.target.value })}
                placeholder="your-email@yourdomain.com"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block">Password</label>
              <div className="relative">
                <Input 
                  type={showPassword ? "text" : "password"}
                  value={smtpConfig.password}
                  onChange={(e) => setSMTPConfig({ ...smtpConfig, password: e.target.value })}
                  placeholder="Your Zoho Mail password"
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block">From Email</label>
              <Input 
                value={smtpConfig.fromEmail}
                onChange={(e) => setSMTPConfig({ ...smtpConfig, fromEmail: e.target.value })}
                placeholder="noreply@nursehaven.com"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-700 dark:text-gray-300 mb-2 block">From Name</label>
              <Input 
                value={smtpConfig.fromName}
                onChange={(e) => setSMTPConfig({ ...smtpConfig, fromName: e.target.value })}
                placeholder="NurseHaven"
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <AlertCircle className="size-5 text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Use SSL/TLS encryption (Port 465) for secure email delivery. App-specific passwords recommended.
            </p>
          </div>

          {/* Email Service Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Connection Status</p>
              <Badge className={
                emailServiceStatus === 'connected' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1' :
                emailServiceStatus === 'disconnected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 mt-1' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mt-1'
              }>
                {emailServiceStatus === 'connected' ? '✓ Connected' : 
                 emailServiceStatus === 'disconnected' ? '✗ Disconnected' : 
                 'Unknown'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Provider</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">ZeptoMail</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">From Address</p>
              <p className="text-sm text-gray-900 dark:text-white mt-1 truncate">{smtpConfig.fromEmail || 'Not configured'}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleSaveSMTP} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4 mr-2" />
                  Save SMTP Config
                </>
              )}
            </Button>
            <Button onClick={handleTestSMTP} variant="outline" disabled={testing}>
              {testing ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="size-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>

          {/* Send Test Email Section */}
          <div className="border-t dark:border-gray-700 pt-4 mt-4">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Send Test Email</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Send a test email to verify your SMTP configuration is working correctly.
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Enter recipient email address"
                className="flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
              <Button onClick={handleSendTestEmail} disabled={sendingTestEmail || !testEmailAddress}>
                {sendingTestEmail ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="size-4 mr-2" />
                    Send Test
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Payment Integration */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="size-5 text-green-600" />
            <CardTitle className="dark:text-white">Stripe Payment Integration</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">Configure Stripe for payment processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input 
              type="checkbox" 
              checked={stripeConfig.testMode}
              onChange={(e) => setStripeConfig({ ...stripeConfig, testMode: e.target.checked })}
              className="size-4"
            />
            <label className="text-gray-700 dark:text-gray-300">
              Test Mode (Use Stripe test keys)
            </label>
            {stripeConfig.testMode && (
              <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Test Mode Active
              </Badge>
            )}
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">
              Publishable Key {stripeConfig.testMode ? '(Test)' : '(Live)'}
            </label>
            <Input 
              value={stripeConfig.publishableKey}
              onChange={(e) => setStripeConfig({ ...stripeConfig, publishableKey: e.target.value })}
              placeholder={stripeConfig.testMode ? "pk_test_..." : "pk_live_..."}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
            />
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">
              Secret Key {stripeConfig.testMode ? '(Test)' : '(Live)'}
            </label>
            <div className="relative">
              <Input 
                type={showStripeSecret ? "text" : "password"}
                value={stripeConfig.secretKey}
                onChange={(e) => setStripeConfig({ ...stripeConfig, secretKey: e.target.value })}
                placeholder={stripeConfig.testMode ? "sk_test_..." : "sk_live_..."}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowStripeSecret(!showStripeSecret)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showStripeSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-gray-700 dark:text-gray-300 mb-2 block">Webhook Secret</label>
            <Input 
              value={stripeConfig.webhookSecret}
              onChange={(e) => setStripeConfig({ ...stripeConfig, webhookSecret: e.target.value })}
              placeholder="whsec_..."
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
            />
          </div>

          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white">Stripe Setup Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Log in to your Stripe Dashboard at <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">dashboard.stripe.com</a></li>
              <li>Navigate to Developers → API keys</li>
              <li>Copy your Publishable and Secret keys (Test or Live mode)</li>
              <li>Set up a webhook endpoint for events:
                <code className="block mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                  https://yourdomain.com/api/stripe/webhook
                </code>
              </li>
              <li>Configure webhook to listen for: <code className="text-xs">payment_intent.succeeded</code>, <code className="text-xs">customer.subscription.created</code>, <code className="text-xs">customer.subscription.updated</code></li>
              <li>Copy the webhook signing secret</li>
            </ol>
          </div>

          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Always use test mode during development. Switch to live mode only when ready for production.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Subscription Plans</p>
              <p className="text-2xl text-gray-900 dark:text-white mt-1">3</p>
              <p className="text-xs text-gray-500 mt-1">Free, Pro, Premium</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Payment Methods</p>
              <p className="text-2xl text-gray-900 dark:text-white mt-1">Multiple</p>
              <p className="text-xs text-gray-500 mt-1">Card, Apple Pay, Google Pay</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <Badge className={stripeConfig.secretKey ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mt-1"}>
                {stripeConfig.secretKey ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
          </div>

          <Button onClick={handleSaveStripe}>
            <Save className="size-4 mr-2" />
            Save Stripe Config
          </Button>
        </CardContent>
      </Card>

      {/* AI Integration */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="size-5 text-blue-600" />
            <CardTitle className="dark:text-white">AI Integration</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">Configure AI integrations for enhanced functionality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="openai">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="openai">OpenAI</TabsTrigger>
              <TabsTrigger value="deepseek">DeepSeek</TabsTrigger>
            </TabsList>
            <TabsContent value="openai">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">API Key</label>
                  <div className="relative">
                    <Input 
                      type={showOpenAIKey ? "text" : "password"}
                      value={openAIConfig.apiKey}
                      onChange={(e) => setOpenAIConfig({ ...openAIConfig, apiKey: e.target.value })}
                      placeholder="Your OpenAI API key"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showOpenAIKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">Model</label>
                  <Input 
                    value={openAIConfig.model}
                    onChange={(e) => setOpenAIConfig({ ...openAIConfig, model: e.target.value })}
                    placeholder="gpt-4-turbo"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">Max Tokens</label>
                  <Input 
                    type="number"
                    value={openAIConfig.maxTokens}
                    onChange={(e) => setOpenAIConfig({ ...openAIConfig, maxTokens: parseInt(e.target.value) })}
                    placeholder="2000"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">Temperature</label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={openAIConfig.temperature}
                    onChange={(e) => setOpenAIConfig({ ...openAIConfig, temperature: parseFloat(e.target.value) })}
                    placeholder="0.7"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAIIntegration} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        Save OpenAI Config
                      </>
                    )}
                  </Button>
                  <Button onClick={handleTestOpenAIConnection} variant="outline" disabled={testing}>
                    {testing ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="deepseek">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">API Key</label>
                  <div className="relative">
                    <Input 
                      type={showDeepSeekKey ? "text" : "password"}
                      value={deepSeekConfig.apiKey}
                      onChange={(e) => setDeepSeekConfig({ ...deepSeekConfig, apiKey: e.target.value })}
                      placeholder="Your DeepSeek API key"
                      className="dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10 font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeepSeekKey(!showDeepSeekKey)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showDeepSeekKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">Model</label>
                  <Input 
                    value={deepSeekConfig.model}
                    onChange={(e) => setDeepSeekConfig({ ...deepSeekConfig, model: e.target.value })}
                    placeholder="deepseek-chat"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">Max Tokens</label>
                  <Input 
                    type="number"
                    value={deepSeekConfig.maxTokens}
                    onChange={(e) => setDeepSeekConfig({ ...deepSeekConfig, maxTokens: parseInt(e.target.value) })}
                    placeholder="4000"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-gray-700 dark:text-gray-300 mb-2 block">Temperature</label>
                  <Input 
                    type="number"
                    step="0.1"
                    value={deepSeekConfig.temperature}
                    onChange={(e) => setDeepSeekConfig({ ...deepSeekConfig, temperature: parseFloat(e.target.value) })}
                    placeholder="0.7"
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveAIIntegration} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        Save DeepSeek Config
                      </>
                    )}
                  </Button>
                  <Button onClick={handleTestDeepSeekConnection} variant="outline" disabled={testing}>
                    {testing ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white">AI Integration Instructions:</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li>Sign up for an account at <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">OpenAI</a> or <a href="https://deepseek.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">DeepSeek</a></li>
              <li>Navigate to API keys section</li>
              <li>Copy your API key</li>
              <li>Configure the model, max tokens, and temperature as needed</li>
              <li>Save the configuration</li>
              <li>Test the connection to ensure everything is working</li>
            </ol>
          </div>
          <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertCircle className="size-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Always validate your API keys before saving. Use test keys during development.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">OpenAI Status</p>
              <Badge className={openAIConfig.apiKey ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mt-1"}>
                {openAIConfig.apiKey ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">DeepSeek Status</p>
              <Badge className={deepSeekConfig.apiKey ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1" : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 mt-1"}>
                {deepSeekConfig.apiKey ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Usage Stats</p>
              <Button onClick={handleGetAIUsageStats} size="sm">
                <Activity className="size-4 mr-2" />
                Get Stats
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleExportAIConfiguration}>
              <Download className="size-4 mr-2" />
              Export Configuration
            </Button>
            <Button onClick={handleResetAIIntegration} variant="outline">
              <RotateCcw className="size-4 mr-2" />
              Reset Integration
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-purple-600" />
            <CardTitle className="dark:text-white">Notification Settings</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">Manage email and push notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">New User Registrations</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Notify when new users sign up</p>
            </div>
            <input type="checkbox" defaultChecked className="size-5" />
          </div>
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">Payment Notifications</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Alert on subscription payments</p>
            </div>
            <input type="checkbox" defaultChecked className="size-5" />
          </div>
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">Question Uploads</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Alert on bulk question uploads</p>
            </div>
            <input type="checkbox" defaultChecked className="size-5" />
          </div>
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">System Errors</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Immediate alerts for critical errors</p>
            </div>
            <input type="checkbox" defaultChecked className="size-5" />
          </div>
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">Weekly Reports</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Summary of platform activity</p>
            </div>
            <input type="checkbox" className="size-5" />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-green-600" />
            <CardTitle className="dark:text-white">Security Settings</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">Access control and security options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">Two-Factor Authentication</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Require 2FA for admin accounts</p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Enabled</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">Password Requirements</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Minimum 8 characters, uppercase & numbers</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">Session Timeout</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Auto-logout after inactivity</p>
            </div>
            <select className="px-3 py-2 border dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>2 hours</option>
              <option>Never</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Database */}
      <Card className="border-2 dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="size-5 text-orange-600" />
            <CardTitle className="dark:text-white">Database & Backup</CardTitle>
          </div>
          <CardDescription className="dark:text-gray-400">Data management and backup options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-gray-900 dark:text-white mb-1">Last Backup</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Today at 3:00 AM • All data backed up successfully</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Backup Now</Button>
          </div>
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">Automatic Backups</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Scheduled daily at 3:00 AM</p>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
          </div>
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white mb-1">Storage Usage</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">2.4 GB of 100 GB used</p>
            </div>
            <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '2.4%' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}