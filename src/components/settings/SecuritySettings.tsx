/**
 * Security Settings Component
 * 
 * Displays security summary, login history, and active sessions
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Shield,
  History,
  Monitor,
  Smartphone,
  Globe,
  Check,
  X,
  AlertTriangle,
  Clock,
  MapPin,
  RefreshCw,
  Loader2,
  LogOut,
} from 'lucide-react';
import securityApi, { LoginAuditEntry, SecuritySummary, ActiveSession } from '../../services/api/securityApi';
import { MFASetup } from './MFASetup';

export function SecuritySettings() {
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginAuditEntry[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'sessions'>('overview');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [summaryData, historyData, sessionsData] = await Promise.all([
        securityApi.getSecuritySummary(),
        securityApi.getLoginHistory(20),
        securityApi.getActiveSessions(),
      ]);
      setSummary(summaryData);
      setLoginHistory(historyData);
      setActiveSessions(sessionsData);
    } catch (err) {
      console.error('Failed to load security data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('This will sign you out of all devices except this one. Continue?')) return;
    
    try {
      await securityApi.revokeAllSessions();
      await loadSecurityData();
    } catch (err) {
      console.error('Failed to revoke sessions:', err);
    }
  };

  const getDeviceIcon = (device?: string) => {
    if (device?.toLowerCase().includes('mobile')) return <Smartphone className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getEventBadge = (eventType: string, success: boolean) => {
    if (!success) return <Badge className="bg-red-100 text-red-700">Failed</Badge>;
    
    const badges: Record<string, JSX.Element> = {
      login_success: <Badge className="bg-green-100 text-green-700">Login</Badge>,
      logout: <Badge className="bg-gray-100 text-gray-700">Logout</Badge>,
      password_changed: <Badge className="bg-blue-100 text-blue-700">Password Changed</Badge>,
      mfa_enabled: <Badge className="bg-purple-100 text-purple-700">MFA Enabled</Badge>,
      mfa_disabled: <Badge className="bg-orange-100 text-orange-700">MFA Disabled</Badge>,
      password_reset_requested: <Badge className="bg-yellow-100 text-yellow-700">Reset Requested</Badge>,
      password_reset_completed: <Badge className="bg-green-100 text-green-700">Reset Completed</Badge>,
    };
    
    return badges[eventType] || <Badge className="bg-gray-100 text-gray-700">{eventType}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'overview' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Shield className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'history' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <History className="h-4 w-4 mr-2" />
          Login History
        </Button>
        <Button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'sessions' 
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Monitor className="h-4 w-4 mr-2" />
          Active Sessions ({activeSessions.length})
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Security Summary */}
          {summary && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Security Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {summary.mfaEnabled ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">2FA</span>
                    </div>
                    <p className="font-semibold">
                      {summary.mfaEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Last Password Change</span>
                    </div>
                    <p className="font-semibold">
                      {summary.lastPasswordChange 
                        ? formatRelativeTime(summary.lastPasswordChange)
                        : 'Never'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</span>
                    </div>
                    <p className="font-semibold">{summary.activeSessions}</p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {summary.suspiciousActivityDetected ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    </div>
                    <p className="font-semibold">
                      {summary.suspiciousActivityDetected ? 'Review Needed' : 'Secure'}
                    </p>
                  </div>
                </div>

                {summary.suspiciousActivityDetected && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <strong>Suspicious activity detected.</strong>
                      <p>We noticed unusual login patterns on your account. Please review your login history and active sessions.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* MFA Setup */}
          <MFASetup onStatusChange={() => loadSecurityData()} />
        </div>
      )}

      {/* Login History Tab */}
      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-500" />
                  Login History
                </CardTitle>
                <CardDescription>Recent account activity</CardDescription>
              </div>
              <Button onClick={loadSecurityData} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loginHistory.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No login history available</p>
            ) : (
              <div className="space-y-3">
                {loginHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className={`p-4 rounded-lg border ${
                      !entry.success 
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          {getDeviceIcon(entry.device)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {getEventBadge(entry.eventType, entry.success)}
                            <span className="text-sm text-gray-500">
                              {formatRelativeTime(entry.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <span>{entry.browser || 'Unknown browser'}</span>
                            <span className="mx-1">•</span>
                            <span>{entry.os || 'Unknown OS'}</span>
                            {entry.ipAddress && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  {entry.ipAddress}
                                </span>
                              </>
                            )}
                          </div>
                          {entry.failureReason && (
                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                              {entry.failureReason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Sessions Tab */}
      {activeTab === 'sessions' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-blue-500" />
                  Active Sessions
                </CardTitle>
                <CardDescription>Devices currently signed in to your account</CardDescription>
              </div>
              <Button 
                onClick={handleRevokeAllSessions}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white"
              >
                <LogOut className="h-4 w-4" />
                Sign Out All Devices
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeSessions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No active sessions found</p>
            ) : (
              <div className="space-y-3">
                {activeSessions.map((session, index) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border ${
                      index === 0 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                          {getDeviceIcon(session.device)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {session.browser || 'Unknown browser'} on {session.os || 'Unknown OS'}
                            </span>
                            {index === 0 && (
                              <Badge className="bg-green-100 text-green-700">Current</Badge>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {session.ipAddress && (
                              <span className="flex items-center gap-1">
                                <Globe className="h-3 w-3" />
                                {session.ipAddress}
                              </span>
                            )}
                            <span className="flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              Active {formatRelativeTime(session.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SecuritySettings;
