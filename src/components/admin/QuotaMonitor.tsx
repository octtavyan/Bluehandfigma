import React, { useState, useEffect } from 'react';
import { AlertCircle, Database, TrendingUp, Server, Zap, HardDrive, Activity } from 'lucide-react';
import { getSupabase } from '../../lib/supabase';

interface QuotaStats {
  dbSize: number;
  dbSizeLimit: number;
  apiRequests: number;
  apiRequestsLimit: number;
  edgeFunctionInvocations: number;
  edgeFunctionInvocationsLimit: number;
  storageSize: number;
  storageSizeLimit: number;
  egress: number;
  egressLimit: number;
}

export const QuotaMonitor: React.FC = () => {
  const [quotaWarning, setQuotaWarning] = useState(false);
  const [stats, setStats] = useState<QuotaStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkQuota();
    // Check quota every 5 minutes
    // DISABLED to reduce bandwidth - only check on mount
    // const interval = setInterval(checkQuota, 5 * 60 * 1000);
    // return () => clearInterval(interval);
  }, []);

  const checkQuota = async () => {
    try {
      const supabase = getSupabase();
      
      // CRITICAL FIX: Use proper count queries without fetching data
      // The issue was using select('*') which tries to fetch all columns including massive JSONB items
      // Using select('id') with count only counts rows without fetching data
      const { count: ordersCount, error: ordersError } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true });
      
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('id', { count: 'exact', head: true });
      
      const { count: paintingsCount, error: paintingsError } = await supabase
        .from('paintings')
        .select('id', { count: 'exact', head: true });

      // Log any errors but don't fail
      if (ordersError) console.warn('Orders count error:', ordersError);
      if (clientsError) console.warn('Clients count error:', clientsError);
      if (paintingsError) console.warn('Paintings count error:', paintingsError);

      // Estimate database usage
      const totalRecords = (ordersCount || 0) + (clientsCount || 0) + (paintingsCount || 0);
      const estimatedDbSize = totalRecords * 5; // Rough estimate: 5KB per record

      // Free tier limits
      const limits = {
        dbSize: 500 * 1024, // 500 MB
        apiRequests: 50000, // per month
        edgeFunctions: 500000, // per month
        storage: 1024 // 1 GB
      };

      // Simulate API request counting (you'd need to implement actual tracking)
      const estimatedApiRequests = totalRecords * 10; // Rough estimate

      const quotaStats: QuotaStats = {
        dbSize: estimatedDbSize,
        dbSizeLimit: limits.dbSize,
        apiRequests: estimatedApiRequests,
        apiRequestsLimit: limits.apiRequests,
        edgeFunctionInvocations: 0, // Would need actual metrics
        edgeFunctionInvocationsLimit: limits.edgeFunctions,
        storageSize: 0,
        storageSizeLimit: limits.storage,
        egress: 0,
        egressLimit: 1000000000 // 1 GB
      };

      setStats(quotaStats);

      // Check if any quota is exceeded
      const dbUsagePercent = (quotaStats.dbSize / quotaStats.dbSizeLimit) * 100;
      const apiUsagePercent = (quotaStats.apiRequests / quotaStats.apiRequestsLimit) * 100;

      if (dbUsagePercent > 80 || apiUsagePercent > 80) {
        setQuotaWarning(true);
      } else {
        setQuotaWarning(false);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error checking quota:', error);
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsageColor = (current: number, limit: number): string => {
    const percent = (current / limit) * 100;
    if (percent >= 90) return 'text-red-600 bg-red-50';
    if (percent >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressColor = (current: number, limit: number): string => {
    const percent = (current / limit) * 100;
    if (percent >= 90) return 'bg-red-500';
    if (percent >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-gray-400 animate-spin" />
          <span className="text-gray-600">Checking Supabase quota...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Warning Banner */}
      {quotaWarning && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-red-900 font-medium mb-1">
                Supabase Quota Warning
              </h3>
              <p className="text-sm text-red-700 mb-3">
                You're approaching your Free Plan limits. Consider upgrading to continue without restrictions.
              </p>
              <a
                href="https://supabase.com/dashboard/project/uarntnjpoikeoigyatao/settings/billing/subscription"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Upgrade Plan
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quota Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database Size */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${getUsageColor(stats.dbSize, stats.dbSizeLimit)}`}>
              <Database className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Database Size</h4>
              <p className="text-xs text-gray-500">Free tier: 500 MB</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formatBytes(stats.dbSize)}</span>
              <span className="text-gray-400">/ {formatBytes(stats.dbSizeLimit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(stats.dbSize, stats.dbSizeLimit)}`}
                style={{ width: `${Math.min((stats.dbSize / stats.dbSizeLimit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {((stats.dbSize / stats.dbSizeLimit) * 100).toFixed(1)}% used
            </p>
          </div>
        </div>

        {/* API Requests */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${getUsageColor(stats.apiRequests, stats.apiRequestsLimit)}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">API Requests</h4>
              <p className="text-xs text-gray-500">Free tier: 50K / month</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{stats.apiRequests.toLocaleString()}</span>
              <span className="text-gray-400">/ {stats.apiRequestsLimit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(stats.apiRequests, stats.apiRequestsLimit)}`}
                style={{ width: `${Math.min((stats.apiRequests / stats.apiRequestsLimit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {((stats.apiRequests / stats.apiRequestsLimit) * 100).toFixed(1)}% used
            </p>
          </div>
        </div>

        {/* Edge Functions */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${getUsageColor(stats.edgeFunctionInvocations, stats.edgeFunctionInvocationsLimit)}`}>
              <Zap className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Edge Functions</h4>
              <p className="text-xs text-gray-500">Free tier: 500K / month</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{stats.edgeFunctionInvocations.toLocaleString()}</span>
              <span className="text-gray-400">/ {stats.edgeFunctionInvocationsLimit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(stats.edgeFunctionInvocations, stats.edgeFunctionInvocationsLimit)}`}
                style={{ width: `${Math.min((stats.edgeFunctionInvocations / stats.edgeFunctionInvocationsLimit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {((stats.edgeFunctionInvocations / stats.edgeFunctionInvocationsLimit) * 100).toFixed(1)}% used
            </p>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${getUsageColor(stats.storageSize, stats.storageSizeLimit)}`}>
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">Storage</h4>
              <p className="text-xs text-gray-500">Free tier: 1 GB</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{formatBytes(stats.storageSize * 1024 * 1024)}</span>
              <span className="text-gray-400">/ {formatBytes(stats.storageSizeLimit * 1024 * 1024)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getProgressColor(stats.storageSize, stats.storageSizeLimit)}`}
                style={{ width: `${Math.min((stats.storageSize / stats.storageSizeLimit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {((stats.storageSize / stats.storageSizeLimit) * 100).toFixed(1)}% used
            </p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Tips to Reduce Usage</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Delete old test data and unused records</li>
          <li>• Optimize queries to reduce API calls</li>
          <li>• Use localStorage for temporary data instead of database</li>
          <li>• Clean up old cart sessions regularly</li>
          <li>• Consider upgrading to Pro plan ($25/month) for higher limits</li>
        </ul>
      </div>
    </div>
  );
};