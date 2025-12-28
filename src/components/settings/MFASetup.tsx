/**
 * MFA Setup Component
 * 
 * Allows users to enable/disable two-factor authentication
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import {
  Shield,
  Smartphone,
  Copy,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import mfaApi, { MFASetupResult } from '../../services/api/mfaApi';

interface MFASetupProps {
  onStatusChange?: (enabled: boolean) => void;
}

export function MFASetup({ onStatusChange }: MFASetupProps) {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupData, setSetupData] = useState<MFASetupResult | null>(null);
  const [step, setStep] = useState<'status' | 'setup' | 'verify' | 'backup' | 'disable'>('status');
  const [totpCode, setTotpCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      setLoading(true);
      const status = await mfaApi.getMFAStatus();
      setMfaEnabled(status.mfaEnabled);
    } catch (err) {
      console.error('Failed to check MFA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSetup = async () => {
    try {
      setProcessing(true);
      setError('');
      const data = await mfaApi.setupMFA();
      setSetupData(data);
      setStep('setup');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to initialize MFA setup');
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (totpCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      await mfaApi.enableMFA(totpCode);
      setMfaEnabled(true);
      setStep('backup');
      onStatusChange?.(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setProcessing(false);
    }
  };

  const handleDisableMFA = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      await mfaApi.disableMFA(password);
      setMfaEnabled(false);
      setStep('status');
      setPassword('');
      onStatusChange?.(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid password');
    } finally {
      setProcessing(false);
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setProcessing(true);
      setError('');
      const result = await mfaApi.regenerateBackupCodes(password);
      setSetupData(prev => prev ? { ...prev, backupCodes: result.backupCodes } : null);
      setPassword('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to regenerate backup codes');
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const copyAllBackupCodes = () => {
    if (setupData?.backupCodes) {
      navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedIndex(-1);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-500" />
            <div>
              <CardTitle className="text-lg">Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </div>
          </div>
          <Badge variant={mfaEnabled ? 'default' : 'secondary'}>
            {mfaEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Status View */}
        {step === 'status' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {mfaEnabled
                ? 'Your account is protected with two-factor authentication. You will need to enter a verification code from your authenticator app when signing in.'
                : 'Protect your account by requiring a verification code in addition to your password when signing in.'}
            </p>

            {mfaEnabled ? (
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('disable')}>
                  Disable 2FA
                </Button>
                <Button variant="outline" onClick={() => { setStep('backup'); handleStartSetup(); }}>
                  View Backup Codes
                </Button>
              </div>
            ) : (
              <Button onClick={handleStartSetup} disabled={processing}>
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Enable Two-Factor Authentication
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Setup View */}
        {step === 'setup' && setupData && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Step 1: Scan QR Code
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <img src={setupData.qrCodeUrl} alt="MFA QR Code" className="w-48 h-48" />
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Or enter this code manually:</p>
                <code className="text-sm bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                  {setupData.secret}
                </code>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Step 2: Enter Verification Code</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the 6-digit code from your authenticator app to verify setup
              </p>
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-32 text-center text-lg tracking-widest"
                />
                <Button onClick={handleVerifyAndEnable} disabled={processing || totpCode.length !== 6}>
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Enable'}
                </Button>
              </div>
            </div>

            <Button variant="ghost" onClick={() => { setStep('status'); setSetupData(null); setTotpCode(''); }}>
              Cancel
            </Button>
          </div>
        )}

        {/* Backup Codes View */}
        {step === 'backup' && setupData && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong>Save your backup codes!</strong>
                <p>If you lose access to your authenticator app, you can use these codes to sign in. Each code can only be used once.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {setupData.backupCodes.map((code, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded font-mono text-sm"
                >
                  <span>{code}</span>
                  <button
                    onClick={() => copyToClipboard(code, index)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {copiedIndex === index ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={copyAllBackupCodes}>
                {copiedIndex === -1 ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy All Codes
              </Button>
              <Button onClick={() => { setStep('status'); setSetupData(null); }}>
                Done
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Regenerate Backup Codes
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                If you've used most of your backup codes, you can generate new ones. This will invalidate all previous codes.
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button variant="outline" onClick={handleRegenerateBackupCodes} disabled={processing || !password}>
                  {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Regenerate'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Disable View */}
        {step === 'disable' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <strong>Warning!</strong>
                <p>Disabling two-factor authentication will make your account less secure.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="disable-password">Enter your password to confirm</Label>
              <div className="relative">
                <Input
                  id="disable-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setStep('status'); setPassword(''); setError(''); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDisableMFA} disabled={processing || !password}>
                {processing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Disable Two-Factor Authentication
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MFASetup;
