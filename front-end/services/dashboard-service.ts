import http from '@/lib/http';
import { DashboardRevenueDataResponse, DashboardStatsResponse } from '@/types/dashboard-type';
import { ResponseType } from '@/types/response-type';
import { StudentType } from '@/types';

export interface RevenueByClassResponse {
  classId: string;
  className: string;
  revenue: number;
}

export interface RevenueByPaymentMethodResponse {
  paymentMethod: string;
  paymentMethodLabel: string;
  revenue: number;
  count: number;
}

export interface RevenueByStatusResponse {
  status: string;
  statusLabel: string;
  revenue: number;
  count: number;
}

export const dashboardService = {
  getDashboardStats: () =>
    http.get<ResponseType<DashboardStatsResponse, DashboardStatsResponse>>('/api/dashboard/stats'),
  getRevenueDataByPeriod: (period: '3months' | '6months' | '12months') =>
    http.get<ResponseType<DashboardRevenueDataResponse[], DashboardRevenueDataResponse[]>>(`/api/dashboard/revenue-data/${period}`),
  getStudentsWithUnpaidFees: () =>
    http.get<ResponseType<StudentType[], StudentType[]>>('/api/dashboard/students-with-unpaid-fees'),
  getRevenueByClass: (period: '3months' | '6months' | '12months') =>
    http.get<ResponseType<RevenueByClassResponse[], RevenueByClassResponse[]>>(`/api/dashboard/revenue-statistics/by-class/${period}`),
  getRevenueByPaymentMethod: (period: '3months' | '6months' | '12months') =>
    http.get<ResponseType<RevenueByPaymentMethodResponse[], RevenueByPaymentMethodResponse[]>>(`/api/dashboard/revenue-statistics/by-payment-method/${period}`),
  getRevenueByStatus: (period: '3months' | '6months' | '12months') =>
    http.get<ResponseType<RevenueByStatusResponse[], RevenueByStatusResponse[]>>(`/api/dashboard/revenue-statistics/by-status/${period}`),
};

