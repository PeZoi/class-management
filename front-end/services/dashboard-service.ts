import http from '@/lib/http';
import { 
  DashboardRevenueDataResponse, 
  DashboardStatsResponse,
  RevenueByClassResponse,
  RevenueByPaymentMethodResponse,
  RevenueByStatusResponse
} from '@/types/dashboard-type';
import { ResponseType } from '@/types/response-type';
import { StudentType } from '@/types';
import { TimePeriod } from '@/types/common-type';

export const dashboardService = {
  getDashboardStats: () =>
    http.get<ResponseType<DashboardStatsResponse, DashboardStatsResponse>>('/api/dashboard/stats'),
  getRevenueDataByPeriod: (period: TimePeriod) =>
    http.get<ResponseType<DashboardRevenueDataResponse[], DashboardRevenueDataResponse[]>>(`/api/dashboard/revenue-data/${period}`),
  getStudentsWithUnpaidFees: () =>
    http.get<ResponseType<StudentType[], StudentType[]>>('/api/dashboard/students-with-unpaid-fees'),
  getRevenueByClass: (period: TimePeriod) =>
    http.get<ResponseType<RevenueByClassResponse[], RevenueByClassResponse[]>>(`/api/dashboard/revenue-statistics/by-class/${period}`),
  getRevenueByPaymentMethod: (period: TimePeriod) =>
    http.get<ResponseType<RevenueByPaymentMethodResponse[], RevenueByPaymentMethodResponse[]>>(`/api/dashboard/revenue-statistics/by-payment-method/${period}`),
  getRevenueByStatus: (period: TimePeriod) =>
    http.get<ResponseType<RevenueByStatusResponse[], RevenueByStatusResponse[]>>(`/api/dashboard/revenue-statistics/by-status/${period}`),
};

