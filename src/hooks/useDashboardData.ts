/**
 * useDashboardData Hook
 * 
 * Hook برای استفاده آسان از DashboardDataService در کامپوننت‌های React
 */

import { useState, useEffect, useCallback } from 'react';
import { dashboardDataService, DashboardData } from '../services/DashboardDataService';
import { Logger } from '../core/Logger';

const logger = Logger.getInstance();

interface UseDashboardDataReturn {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  status: {
    isLoading: boolean;
    hasCachedData: boolean;
    cacheAge: number | null;
    autoRefreshActive: boolean;
  };
}

/**
 * Hook برای دریافت و مدیریت داده‌های داشبورد
 * 
 * @param autoLoad - آیا به صورت خودکار داده‌ها بارگذاری شود (پیش‌فرض: true)
 * @returns داده‌های داشبورد و توابع کنترلی
 * 
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data, isLoading, error, refresh } = useDashboardData();
 * 
 *   if (isLoading) return <Loader />;
 *   if (error) return <Error message={error} />;
 * 
 *   return (
 *     <div>
 *       <h1>Portfolio: ${data.stats.portfolioValue}</h1>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDashboardData(autoLoad = true): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * دریافت داده‌ها
   */
  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const dashboardData = await dashboardDataService.getDashboardData(forceRefresh);
      setData(dashboardData);

      logger.info('Dashboard data loaded successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      logger.error('Failed to load dashboard data', {}, err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh دستی
   */
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  /**
   * بارگذاری اولیه
   */
  useEffect(() => {
    if (autoLoad) {
      fetchData();
    }
  }, [autoLoad, fetchData]);

  /**
   * دریافت وضعیت سرویس
   */
  const status = dashboardDataService.getStatus();

  return {
    data,
    isLoading,
    error,
    refresh,
    status
  };
}

export default useDashboardData;
