// Bandwidth usage estimation utility
// Helps track and estimate Supabase bandwidth consumption

export interface BandwidthStats {
  estimatedDailyUsage: number; // MB per day
  estimatedMonthlyUsage: number; // MB per month
  savingsFromOptimization: number; // MB saved
  savingsPercentage: number; // % saved
}

/**
 * Calculate estimated bandwidth usage based on data patterns
 */
export function calculateBandwidthStats(data: {
  totalPaintings: number;
  optimizedPaintings: number;
  totalOrders: number;
  totalBlogPosts: number;
  averageVisitsPerDay: number;
}): BandwidthStats {
  const {
    totalPaintings,
    optimizedPaintings,
    totalOrders,
    totalBlogPosts,
    averageVisitsPerDay = 100 // Default assumption
  } = data;

  // Image sizes (estimates)
  const ORIGINAL_IMAGE_SIZE = 2.5; // MB
  const OPTIMIZED_THUMBNAIL_SIZE = 0.08; // MB
  const OPTIMIZED_MEDIUM_SIZE = 0.4; // MB

  // Calculate bandwidth per page visit
  const unoptimizedPaintings = totalPaintings - optimizedPaintings;
  
  // Homepage + Products page (shows ~20 paintings with thumbnails)
  const paintingsShownPerVisit = 20;
  const bandwidthPerVisitUnoptimized = paintingsShownPerVisit * ORIGINAL_IMAGE_SIZE;
  const bandwidthPerVisitOptimized = paintingsShownPerVisit * OPTIMIZED_THUMBNAIL_SIZE;
  
  // Product detail page (1 medium image)
  const detailPageVisitsPercent = 0.3; // 30% of visitors view detail page
  const detailBandwidthUnoptimized = ORIGINAL_IMAGE_SIZE * detailPageVisitsPercent;
  const detailBandwidthOptimized = OPTIMIZED_MEDIUM_SIZE * detailPageVisitsPercent;

  // Total per visit
  const totalPerVisitUnoptimized = bandwidthPerVisitUnoptimized + detailBandwidthUnoptimized;
  const totalPerVisitOptimized = bandwidthPerVisitOptimized + detailBandwidthOptimized;

  // Calculate daily usage
  const dailyUnoptimized = totalPerVisitUnoptimized * averageVisitsPerDay;
  const dailyOptimized = totalPerVisitOptimized * averageVisitsPerDay;

  // Account for CMS usage (admin users checking orders, paintings, etc.)
  const cmsUsagePerDay = 50; // MB - estimate for admin users
  
  const estimatedDailyUsage = dailyOptimized + cmsUsagePerDay;
  const estimatedMonthlyUsage = estimatedDailyUsage * 30;
  
  const savingsFromOptimization = (dailyUnoptimized - dailyOptimized) * 30;
  const savingsPercentage = Math.round((savingsFromOptimization / (dailyUnoptimized * 30)) * 100);

  return {
    estimatedDailyUsage: Math.round(estimatedDailyUsage),
    estimatedMonthlyUsage: Math.round(estimatedMonthlyUsage),
    savingsFromOptimization: Math.round(savingsFromOptimization),
    savingsPercentage
  };
}

/**
 * Get bandwidth tier information
 */
export function getBandwidthTier(monthlyUsageMB: number): {
  tier: 'free' | 'pro' | 'team';
  limit: number;
  cost: string;
  percentage: number;
  warning: boolean;
} {
  const FREE_TIER_LIMIT = 5000; // 5GB
  const PRO_TIER_LIMIT = 250000; // 250GB
  
  if (monthlyUsageMB <= FREE_TIER_LIMIT) {
    return {
      tier: 'free',
      limit: FREE_TIER_LIMIT,
      cost: '$0/month',
      percentage: Math.round((monthlyUsageMB / FREE_TIER_LIMIT) * 100),
      warning: monthlyUsageMB > FREE_TIER_LIMIT * 0.8 // Warning at 80%
    };
  } else if (monthlyUsageMB <= PRO_TIER_LIMIT) {
    return {
      tier: 'pro',
      limit: PRO_TIER_LIMIT,
      cost: '$25/month',
      percentage: Math.round((monthlyUsageMB / PRO_TIER_LIMIT) * 100),
      warning: monthlyUsageMB > PRO_TIER_LIMIT * 0.8
    };
  } else {
    return {
      tier: 'team',
      limit: PRO_TIER_LIMIT,
      cost: '$125/month+',
      percentage: 100,
      warning: true
    };
  }
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format MB to human readable format
 */
export function formatMB(mb: number): string {
  if (mb < 1) {
    return `${Math.round(mb * 1024)} KB`;
  } else if (mb < 1024) {
    return `${Math.round(mb * 10) / 10} MB`;
  } else {
    return `${Math.round((mb / 1024) * 10) / 10} GB`;
  }
}
