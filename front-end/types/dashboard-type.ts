export interface DashboardStatsResponse {
  totalRevenue: number;
  totalClasses: number;
  totalStudents: number;
  totalTeachers: number;
  totalSalaryExpense: number; // Tổng lương giáo viên cần trả trong tháng này
  revenueGrowth: number;
  studentGrowth: number;
  salaryExpenseGrowth: number; // % tăng trưởng lương so với tháng trước
}

export interface DashboardRevenueDataResponse {
  month: string;
  label: string;
  revenue: number;
  expense: number; // Tổng chi trả lương giáo viên trong tháng này
}

