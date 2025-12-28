/**
 * Stripe Settings Component
 * 
 * Admin dashboard component for configuring Stripe API keys and price IDs
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  CreditCard,
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
} from 'lucide-react';
import { systemSettingsApi, StripeSettingsUpdate } from '../../services/api/systemSettingsApi';

interface StripeFormData {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  proMonthlyPriceId: string;
  proYearlyPriceId: string;
  premiumMonthlyPriceId: string;
  premiumYearlyPriceId: string;
}

export function StripeSettings() {
  const [formData, setFormData] = useState<StripeFormData>({
    secretKey: '',
    publishableKey: '',
    webhookSecret: '',
    proMonthlyPriceId: '',
    proYearlyPriceId: '',
    premiumMonthlyPriceId: '',
    premiumYearlyPriceId: '',
  });
  
  const [configuredFields, setConfiguredFields] = useState<Record<string, boolean>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const settings = await systemSettingsApi.getStripeSettings();
      
      const configured: Record<string, boolean> = {};
      settings.forEach(s => {
        configured[s.key] = s.isConfigured;
      });
      setConfiguredFields(configured);
      
      // Don't populate secret fields - they're masked
      const nonSecretData: Partial<StripeFormData> = {};
      settings.forEach(s => {
        if (!s.isSecret && s.value) {
          const fieldKey = keyToField(s.key);
          if (fieldKey) {
            (nonSecretData as Record<string, string>)[fieldKey] = s.value;
          }
        }
      });
      
      setFormData(prev => ({ ...prev, ...nonSecretData }));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load Stripe settings');
    } finally {
      setLoading(false);
    }
  };

  const keyToField = (key: string): keyof StripeFormData | null => {
    const mapping: Record<string, keyof StripeFormData> = {
      'stripe_secret_key': 'secretKey',
      'stripe_publishable_key': 'publishableKey',
      'stripe_webhook_secret': 'webhookSecret',
      'stripe_pro_monthly_price_id': 'proMonthlyPriceId',
      'stripe_pro_yearly_price_id': 'proYearlyPriceId',
      'stripe_premium_monthly_price_id': 'premiumMonthlyPriceId',
      'stripe_premium_yearly_price_id': 'premiumYearlyPriceId',
    };
    return mapping[key] || null;
  };

  const handleChange = (field: keyof StripeFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    setTestResult(null);
  };

  const toggleShowSecret = (field: string) => {
    setShowSecrets(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Only send fields that have values
      const updates: StripeSettingsUpdate = {};
      if (formData.secretKey) updates.secretKey = formData.secretKey;
      if (formData.publishableKey) updates.publishableKey = formData.publishableKey;
      if (formData.webhookSecret) updates.webhookSecret = formData.webhookSecret;
      if (formData.proMonthlyPriceId) updates.proMonthlyPriceId = formData.proMonthlyPriceId;
      if (formData.proYearlyPriceId) updates.proYearlyPriceId = formData.proYearlyPriceId;
      if (formData.premiumMonthlyPriceId) updates.premiumMonthlyPriceId = formData.premiumMonthlyPriceId;
      if (formData.premiumYearlyPriceId) updates.premiumYearlyPriceId = formData.premiumYearlyPriceId;
      
      await systemSettingsApi.updateStripeSettings(updates);
      setSaveSuccess(true);
      
      // Reload to get updated configured status
      await loadSettings();
      
      // Clear secret fields after save (they're stored but masked)
      setFormData(prev => ({
        ...prev,
        secretKey: '',
        webhookSecret: '',
      }));
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to save Stripe settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const result = await systemSettingsApi.testStripeConnection();
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.response?.data?.error?.message || 'Connection test failed',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <CreditCard className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="dark:text-white">Stripe Configuration</CardTitle>
              <CardDescription className="dark:text-gray-400">
                Configure your Stripe API keys and subscription price IDs
              </CardDescription>
            </div>
          </div>
          <a
            href="https://dashboard.stripe.com/apikeys"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ExternalLink className="size-4" />
            Stripe Dashboard
          </a>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
            <XCircle className="size-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {saveSuccess && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
            <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-800 dark:text-green-200">Stripe settings saved successfully!</p>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div className={`p-4 rounded-lg flex items-center gap-3 ${
            testResult.success 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            {testResult.success ? (
              <CheckCircle className="size-5 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="size-5 text-red-600 dark:text-red-400" />
            )}
            <p className={`text-sm ${
              testResult.success 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              {testResult.message}
            </p>
          </div>
        )}

        {/* API Keys Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Key className="size-5" />
            API Keys
          </h3>
          
          {/* Secret Key */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="secretKey" className="dark:text-gray-300">Secret Key</Label>
              {configuredFields['stripe_secret_key'] && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Configured
                </Badge>
              )}
            </div>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecrets['secretKey'] ? 'text' : 'password'}
                placeholder={configuredFields['stripe_secret_key'] ? '••••••••••••••••••••' : 'sk_live_...'}
                value={formData.secretKey}
                onChange={(e) => handleChange('secretKey', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => toggleShowSecret('secretKey')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                title={showSecrets['secretKey'] ? 'Hide' : 'Show'}
              >
                {showSecrets['secretKey'] ? (
                  <EyeOff className="size-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Eye className="size-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Your Stripe secret key (starts with sk_live_ or sk_test_)
            </p>
          </div>

          {/* Publishable Key */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="publishableKey" className="dark:text-gray-300">Publishable Key</Label>
              {configuredFields['stripe_publishable_key'] && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Configured
                </Badge>
              )}
            </div>
            <Input
              id="publishableKey"
              type="text"
              placeholder="pk_live_..."
              value={formData.publishableKey}
              onChange={(e) => handleChange('publishableKey', e.target.value)}
              className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono"
            />
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Your Stripe publishable key (starts with pk_live_ or pk_test_)
            </p>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="webhookSecret" className="dark:text-gray-300">Webhook Secret</Label>
              {configuredFields['stripe_webhook_secret'] && (
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  Configured
                </Badge>
              )}
            </div>
            <div className="relative">
              <Input
                id="webhookSecret"
                type={showSecrets['webhookSecret'] ? 'text' : 'password'}
                placeholder={configuredFields['stripe_webhook_secret'] ? '••••••••••••••••••••' : 'whsec_...'}
                value={formData.webhookSecret}
                onChange={(e) => handleChange('webhookSecret', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 pr-10 font-mono"
              />
              <button
                type="button"
                onClick={() => toggleShowSecret('webhookSecret')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                title={showSecrets['webhookSecret'] ? 'Hide' : 'Show'}
              >
                {showSecrets['webhookSecret'] ? (
                  <EyeOff className="size-4 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Eye className="size-4 text-gray-500 dark:text-gray-400" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Webhook signing secret for verifying Stripe events
            </p>
          </div>
        </div>

        {/* Price IDs Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="size-5" />
            Subscription Price IDs
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pro Monthly */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="proMonthlyPriceId" className="dark:text-gray-300">Pro Monthly</Label>
                {configuredFields['stripe_pro_monthly_price_id'] && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                    Set
                  </Badge>
                )}
              </div>
              <Input
                id="proMonthlyPriceId"
                type="text"
                placeholder="price_..."
                value={formData.proMonthlyPriceId}
                onChange={(e) => handleChange('proMonthlyPriceId', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
              />
            </div>

            {/* Pro Yearly */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="proYearlyPriceId" className="dark:text-gray-300">Pro Yearly</Label>
                {configuredFields['stripe_pro_yearly_price_id'] && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                    Set
                  </Badge>
                )}
              </div>
              <Input
                id="proYearlyPriceId"
                type="text"
                placeholder="price_..."
                value={formData.proYearlyPriceId}
                onChange={(e) => handleChange('proYearlyPriceId', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
              />
            </div>

            {/* Premium Monthly */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="premiumMonthlyPriceId" className="dark:text-gray-300">Premium Monthly</Label>
                {configuredFields['stripe_premium_monthly_price_id'] && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                    Set
                  </Badge>
                )}
              </div>
              <Input
                id="premiumMonthlyPriceId"
                type="text"
                placeholder="price_..."
                value={formData.premiumMonthlyPriceId}
                onChange={(e) => handleChange('premiumMonthlyPriceId', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
              />
            </div>

            {/* Premium Yearly */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="premiumYearlyPriceId" className="dark:text-gray-300">Premium Yearly</Label>
                {configuredFields['stripe_premium_yearly_price_id'] && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                    Set
                  </Badge>
                )}
              </div>
              <Input
                id="premiumYearlyPriceId"
                type="text"
                placeholder="price_..."
                value={formData.premiumYearlyPriceId}
                onChange={(e) => handleChange('premiumYearlyPriceId', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600 font-mono text-sm"
              />
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">Important</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use test keys (sk_test_, pk_test_) for development</li>
                <li>Use live keys (sk_live_, pk_live_) for production</li>
                <li>Secret keys are encrypted before storage</li>
                <li>Changes take effect immediately</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {saving ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <Save className="size-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button
            onClick={handleTestConnection}
            disabled={testing}
            className="bg-gray-600 hover:bg-gray-700"
          >
            {testing ? (
              <Loader2 className="size-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="size-4 mr-2" />
            )}
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default StripeSettings;
