import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard-service';
import { DashboardStatsResponse, DashboardRevenueDataResponse } from '@/types/dashboard-type';
import { StudentType } from '@/types';
import { queryKeys } from '@/lib/queryKeys';

type TimePeriod = '3months' | '6months' | '12months';

/**
 * Hook để lấy dashboard stats
 */
export function useDashboardStats() {
  return useQuery<DashboardStatsResponse>({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      const response = await dashboardService.getDashboardStats();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch dashboard stats');
    },
  });
}

/**
 * Hook để lấy revenue data theo period
 */
export function useDashboardRevenueData(period: TimePeriod) {
  return useQuery<DashboardRevenueDataResponse[]>({
    queryKey: queryKeys.dashboard.revenueData(period),
    queryFn: async () => {
      const response = await dashboardService.getRevenueDataByPeriod(period);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch revenue data');
    },
  });
}

/**
 * Hook để lấy students với unpaid fees
 */
export function useStudentsWithUnpaidFees() {
  return useQuery<StudentType[]>({
    queryKey: queryKeys.dashboard.studentsWithUnpaidFees(),
    queryFn: async () => {
      const response = await dashboardService.getStudentsWithUnpaidFees();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch students with unpaid fees');
    },
  });
}

