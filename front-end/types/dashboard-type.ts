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

// Overdue payment information for dashboard
export interface OverduePayment {
  id: number;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  studentGender?: string;
  studentBirthDate?: string;
  startDate?: string;
  className: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
  contacted: boolean;
  parentName?: string;
  parentPhone?: string;
}

