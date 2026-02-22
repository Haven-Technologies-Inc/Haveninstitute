'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ArrowLeft,
  CreditCard,
  Brain,
  Bot,
  MessageSquare,
  Mail,
  Globe,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Plug,
  Activity,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface EnvVarStatus {
  name: string;
  isSet: boolean;
  maskedValue: string | null;
}

interface IntegrationData {
  service: string;
  label: string;
  description: string;
  category: string;
  status: 'connected' | 'not_configured' | 'error';
  envVars: EnvVarStatus[];
  lastTested: string | null;
  lastTestResult: string | null;
}

interface SummaryData {
  total: number;
  connected: number;
  needsAttention: number;
}

interface TestResult {
  testedAt: string;
  success: boolean;
  message: string;
}

const serviceIcons: Record<string, typeof CreditCard> = {
  stripe: CreditCard,
  openai: Brain,
  grok: Bot,
  twilio: MessageSquare,
  zeptomail: Mail,
  google: Globe,
  database: Database,
};

const serviceGradients: Record<string, string> = {
  stripe: 'from-indigo-500 to-purple-600',
  openai: 'from-emerald-500 to-teal-600',
  grok: 'from-gray-700 to-gray-900',
  twilio: 'from-red-500 to-rose-600',
  zeptomail: 'from-blue-500 to-cyan-600',
  google: 'from-red-500 to-amber-500',
  database: 'from-orange-500 to-yellow-600',
};

const statusConfig = {
  connected: {
    label: 'Connected',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    icon: CheckCircle2,
  },
  not_configured: {
    label: 'Not Configured',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    icon: AlertTriangle,
  },
  error: {
    label: 'Partial Config',
    className: 'bg-red-500/10 text-red-600 dark:text-red-400',
    icon: XCircle,
  },
};

function IntegrationsSkeleton() {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-5 w-96" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminIntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationData[]>([]);
  const [summary, setSummary] = useState<SummaryData>({ total: 0, connected: 0, needsAttention: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/integrations');
      if (!res.ok) throw new Error('Failed to fetch integrations');
      const json = await res.json();
      setIntegrations(json.data.integrations);
      setSummary(json.data.summary);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleTestConnection = async (service: string) => {
    try {
      setTestingService(service);
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service, action: 'test' }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Test failed');
      }

      const result: TestResult = {
        testedAt: json.data.testedAt,
        success: json.data.success,
        message: json.data.message,
      };

      setTestResults((prev) => ({ ...prev, [service]: result }));

      if (result.success) {
        toast.success(`${service}: ${result.message}`);
      } else {
        toast.error(`${service}: ${result.message}`);
      }
    } catch (err: any) {
      const result: TestResult = {
        testedAt: new Date().toISOString(),
        success: false,
        message: err.message,
      };
      setTestResults((prev) => ({ ...prev, [service]: result }));
      toast.error(`Test failed: ${err.message}`);
    } finally {
      setTestingService(null);
    }
  };

  if (loading) return <IntegrationsSkeleton />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-semibold mb-2">Failed to Load Integrations</h2>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <Button onClick={fetchIntegrations} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl font-bold">API Integrations</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Manage external service connections and API keys
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchIntegrations}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Plug className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Integrations</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold">{summary.connected}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Connected</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-2xl font-bold">{summary.needsAttention}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Needs Attention</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Integration Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {integrations.map((integration, i) => {
          const Icon = serviceIcons[integration.service] || Plug;
          const gradient = serviceGradients[integration.service] || 'from-gray-500 to-gray-700';
          const status = statusConfig[integration.status];
          const StatusIcon = status.icon;
          const testResult = testResults[integration.service];
          const isTesting = testingService === integration.service;

          return (
            <motion.div
              key={integration.service}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="border-0 shadow-sm h-full">
                <CardContent className="p-6">
                  {/* Service Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          'h-12 w-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0',
                          gradient
                        )}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{integration.label}</h3>
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', status.className)}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {integration.description}
                        </p>
                        <Badge variant="outline" className="text-[10px] mt-1.5">
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator className="mb-4" />

                  {/* Environment Variables */}
                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Environment Variables
                    </p>
                    <div className="space-y-1.5">
                      {integration.envVars.map((envVar) => (
                        <div
                          key={envVar.name}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <code className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">
                            {envVar.name}
                          </code>
                          {envVar.isSet ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground font-mono truncate max-w-[140px]">
                                {envVar.maskedValue}
                              </span>
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-muted-foreground">Not set</span>
                              <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Result */}
                  {testResult && (
                    <div
                      className={cn(
                        'rounded-lg px-3 py-2 mb-4 text-xs',
                        testResult.success
                          ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                          : 'bg-red-500/10 text-red-700 dark:text-red-400'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {testResult.success ? (
                          <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        )}
                        <div>
                          <p className="font-medium">{testResult.message}</p>
                          <p className="text-[10px] opacity-70 mt-0.5">
                            Tested {new Date(testResult.testedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Test Connection Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => handleTestConnection(integration.service)}
                    disabled={isTesting || integration.status === 'not_configured'}
                  >
                    {isTesting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Testing Connection...
                      </>
                    ) : (
                      <>
                        <Activity className="h-3.5 w-3.5" />
                        Test Connection
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
