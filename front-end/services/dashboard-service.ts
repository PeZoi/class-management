import http from '@/lib/http';
import {
  DashboardRevenueDataResponse,
  DashboardStatsResponse,
  RevenueByClassResponse,
  RevenueByPaymentMethodResponse,
  RevenueByStatusResponse,
} from '@/types/dashboard-type';
import { ResponseType } from '@/types/response-type';
import { PageResponse, StudentType } from '@/types';
import { TimePeriod } from '@/types/common-type';

export const dashboardService = {
  getDashboardStats: () =>
    http.get<ResponseType<DashboardStatsResponse, DashboardStatsResponse>>('/api/dashboard/stats'),
  getRevenueDataByPeriod: (period: TimePeriod) =>
    http.get<ResponseType<DashboardRevenueDataResponse[], DashboardRevenueDataResponse[]>>(
      `/api/dashboard/revenue-data/${period}`,
    ),
  getStudentsWithUnpaidFees: (page: number, size: number) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));

    return http.get<ResponseType<PageResponse<StudentType>, PageResponse<StudentType>>>(
      `/api/dashboard/students-with-unpaid-fees?${params.toString()}`,
    );
  },
  getRevenueByClass: (period: TimePeriod) =>
    http.get<ResponseType<RevenueByClassResponse[], RevenueByClassResponse[]>>(`/api/dashboard/revenue-statistics/by-class/${period}`),
  getRevenueByPaymentMethod: (period: TimePeriod) =>
    http.get<ResponseType<RevenueByPaymentMethodResponse[], RevenueByPaymentMethodResponse[]>>(`/api/dashboard/revenue-statistics/by-payment-method/${period}`),
  getRevenueByStatus: (period: TimePeriod) =>
    http.get<ResponseType<RevenueByStatusResponse[], RevenueByStatusResponse[]>>(`/api/dashboard/revenue-statistics/by-status/${period}`),
};

