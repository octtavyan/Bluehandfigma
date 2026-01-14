// Bandwidth Usage Dashboard Widget
// Shows estimated Supabase bandwidth usage and optimization impact

import React from 'react';
import { TrendingDown, Database, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { calculateBandwidthStats, getBandwidthTier, formatMB } from '../../lib/bandwidthCalculator';

interface BandwidthDashboardProps {
  totalPaintings: number;
  optimizedPaintings: number;
  totalOrders: number;
  totalBlogPosts: number;
}

export const BandwidthDashboard: React.FC<BandwidthDashboardProps> = ({
  totalPaintings,
  optimizedPaintings,
  totalOrders,
  totalBlogPosts
}) => {
  const stats = calculateBandwidthStats({
    totalPaintings,
    optimizedPaintings,
    totalOrders,
    totalBlogPosts,
    averageVisitsPerDay: 100 // Can be adjusted based on analytics
  });

  const tier = getBandwidthTier(stats.estimatedMonthlyUsage);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Database className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Utilizare Bandwidth
            </h3>
            <p className="text-sm text-gray-600">
              Estimare bazată pe trafic actual
            </p>
          </div>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Zilnic</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {formatMB(stats.estimatedDailyUsage)}
          </p>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">Lunar</span>
          </div>
          <p className="text-2xl font-semibold text-gray-900">
            {formatMB(stats.estimatedMonthlyUsage)}
          </p>
        </div>
      </div>

      {/* Tier Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">
            Plan {tier.tier.toUpperCase()}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {tier.percentage}% utilizat
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              tier.warning
                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
            }`}
            style={{ width: `${Math.min(tier.percentage, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">0</span>
          <span className="text-xs text-gray-500">
            {formatMB(tier.limit)} limit
          </span>
        </div>
      </div>

      {/* Optimization Impact */}
      <div
        className={`p-4 rounded-lg border-2 ${
          stats.savingsFromOptimization > 0
            ? 'bg-green-50 border-green-200'
            : 'bg-yellow-50 border-yellow-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {stats.savingsFromOptimization > 0 ? (
            <TrendingDown className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h4
              className={`text-sm font-medium mb-1 ${
                stats.savingsFromOptimization > 0
                  ? 'text-green-900'
                  : 'text-yellow-900'
              }`}
            >
              {stats.savingsFromOptimization > 0
                ? 'Economie prin Optimizare'
                : 'Optimizare Recomandată'}
            </h4>
            {stats.savingsFromOptimization > 0 ? (
              <div className="space-y-1">
                <p className="text-sm text-green-800">
                  <span className="font-semibold">
                    {formatMB(stats.savingsFromOptimization)}
                  </span>{' '}
                  economiți lunar
                </p>
                <p className="text-xs text-green-700">
                  {stats.savingsPercentage}% reducere în trafic imagine
                </p>
              </div>
            ) : (
              <p className="text-sm text-yellow-800">
                Optimizați imaginile pentru a reduce utilizarea bandwidth-ului
                cu până la 90%
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning Alert */}
      {tier.warning && (
        <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-orange-900 mb-1">
                Atenție: Aproape de Limită
              </h4>
              <p className="text-xs text-orange-800">
                Utilizarea dvs. se apropie de limita planului {tier.tier.toUpperCase()}.
                Optimizați mai multe imagini sau upgrade la un plan superior.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {!tier.warning && tier.tier === 'free' && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Perfect! 🎉
              </h4>
              <p className="text-xs text-blue-800">
                Rămâneți în planul gratuit cu optimizările curente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Optimization Recommendations */}
      {optimizedPaintings < totalPaintings && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Recomandări:
          </h4>
          <ul className="space-y-1 text-xs text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Optimizați {totalPaintings - optimizedPaintings} tablouri rămase
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              Economisiți până la{' '}
              {formatMB((totalPaintings - optimizedPaintings) * 2.5 * 30)} / lună
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
