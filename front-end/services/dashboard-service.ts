import http from '@/lib/http';
import { DashboardRevenueDataResponse, DashboardStatsResponse } from '@/types/dashboard-type';
import { ResponseType } from '@/types/response-type';
import { StudentType } from '@/types';

export const dashboardService = {
  getDashboardStats: () =>
    http.get<ResponseType<DashboardStatsResponse, DashboardStatsResponse>>('/api/dashboard/stats'),
  getRevenueDataByPeriod: (period: '3months' | '6months' | '12months') =>
    http.get<ResponseType<DashboardRevenueDataResponse[], DashboardRevenueDataResponse[]>>(`/api/dashboard/revenue-data/${period}`),
  getStudentsWithUnpaidFees: () =>
    http.get<ResponseType<StudentType[], StudentType[]>>('/api/dashboard/students-with-unpaid-fees'),
};

