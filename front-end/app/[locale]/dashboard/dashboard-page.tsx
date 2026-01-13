'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect, useCallback } from 'react';
import { formatCurrency } from '@/utils/helper';
import { OverdueStudentsTable, RecentClassesTable, RevenueChart, StatsCards } from '@/app/[locale]/dashboard/_components';
import { classService, dashboardService } from '@/services';
import { ClassType } from '@/types/class-type';
import { DashboardRevenueDataResponse, DashboardStatsResponse } from '@/types/dashboard-type';
import { StudentType } from '@/types';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';

type TimePeriod = '3months' | '6months' | '12months';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');
  const [topClasses, setTopClasses] = useState<ClassType[]>([]);
  const [overdueStudents, setOverdueStudents] = useState<StudentType[]>([]);
  const [revenueData, setRevenueData] = useState<DashboardRevenueDataResponse[]>([]);
  const [statsData, setStatsData] = useState<DashboardStatsResponse>({
    totalRevenue: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalSalaryExpense: 0,
    revenueGrowth: 0,
    studentGrowth: 0,
    salaryExpenseGrowth: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await dashboardService.getDashboardStats();
      if (response.status === 200 && response.data) {
        setStatsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Không thể tải dữ liệu thống kê');
    }
  }, []);

  // Fetch revenue data by period
  const fetchRevenueData = useCallback(async (period: TimePeriod) => {
    try {
      const response = await dashboardService.getRevenueDataByPeriod(period);
      if (response.status === 200 && response.data) {
        setRevenueData(response.data);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Không thể tải dữ liệu doanh thu');
      setRevenueData([]);
    }
  }, []);

  // Fetch top 3 classes by revenue
  const fetchTop3Classes = useCallback(async () => {
    try {
      const response = await classService.getTop3ClassesByRevenue();
      if (response.status === 200 && response.data) {
        setTopClasses(response.data);
      }
    } catch (error) {
      console.error('Error fetching top 3 classes:', error);
      toast.error('Không thể tải dữ liệu top 3 lớp học');
      setTopClasses([]);
    }
  }, []);

  // Fetch students with unpaid fees
  const fetchOverdueStudents = useCallback(async () => {
    try {
      const response = await dashboardService.getStudentsWithUnpaidFees();
      if (response.status === 200 && response.data) {
        setOverdueStudents(response.data);
      }
    } catch (error) {
      console.error('Error fetching overdue students:', error);
      toast.error('Không thể tải danh sách học viên chưa đóng tiền');
      setOverdueStudents([]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchRevenueData(selectedPeriod),
          fetchTop3Classes(),
          fetchOverdueStudents(),
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch revenue data when period changes
  useEffect(() => {
    fetchRevenueData(selectedPeriod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
            {t('title')}
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">{t('overview')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsCards statsData={statsData} formatCurrency={formatCurrency} />

      {/* Charts */}
      <RevenueChart
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        currentRevenueData={revenueData}
        formatCurrency={formatCurrency}
        className="w-full"
      />

      {/* Top 3 Classes by Revenue Table */}
      <RecentClassesTable topClasses={topClasses} formatCurrency={formatCurrency} />

      {/* Overdue Students Table */}
      <OverdueStudentsTable students={overdueStudents} formatCurrency={formatCurrency} />
    </div>
  );
}
