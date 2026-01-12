export interface DashboardStatsResponse {
  totalRevenue: number;
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  revenueGrowth: number;
  studentGrowth: number;
}

export interface DashboardRevenueDataResponse {
  month: string;
  label: string;
  revenue: number;
}

