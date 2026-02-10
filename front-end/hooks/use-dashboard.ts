import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard-service';
import { 
  DashboardStatsResponse, 
  DashboardRevenueDataResponse,
  RevenueByClassResponse,
  RevenueByPaymentMethodResponse,
  RevenueByStatusResponse
} from '@/types/dashboard-type';
import { StudentType } from '@/types';
import { queryKeys } from '@/lib/queryKeys';
import { TimePeriod } from '@/types/common-type';

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

/**
 * Hook để lấy doanh thu theo lớp học
 */
export function useRevenueByClass(period: TimePeriod) {
  return useQuery<RevenueByClassResponse[]>({
    queryKey: queryKeys.dashboard.revenueByClass(period),
    queryFn: async () => {
      const response = await dashboardService.getRevenueByClass(period);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch revenue by class');
    },
  });
}

/**
 * Hook để lấy doanh thu theo phương thức thanh toán
 */
export function useRevenueByPaymentMethod(period: TimePeriod) {
  return useQuery<RevenueByPaymentMethodResponse[]>({
    queryKey: queryKeys.dashboard.revenueByPaymentMethod(period),
    queryFn: async () => {
      const response = await dashboardService.getRevenueByPaymentMethod(period);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch revenue by payment method');
    },
  });
}

/**
 * Hook để lấy doanh thu theo trạng thái thanh toán
 */
export function useRevenueByStatus(period: TimePeriod) {
  return useQuery<RevenueByStatusResponse[]>({
    queryKey: queryKeys.dashboard.revenueByStatus(period),
    queryFn: async () => {
      const response = await dashboardService.getRevenueByStatus(period);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch revenue by status');
    },
  });
}

