'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/helper';
import { OverdueStudentsTable, RecentClassesTable, RevenueChart, StatsCards } from '@/app/[locale]/dashboard/_components';
import { useQueryClient } from '@tanstack/react-query';
import { PaymentCalendarDialog } from '@/app/[locale]/student-management/_components/payment-calendar-dialog';
import {
  useDashboardStats,
  useDashboardRevenueData,
  useStudentsWithUnpaidFees,
} from '@/hooks/use-dashboard';
import { useTop3ClassesByRevenue } from '@/hooks/use-classes';
import { PageLoading } from '@/components/page-loading';
import { toast } from 'react-toastify';
import { invalidateDashboard, invalidateTop3ClassesByRevenue } from '@/lib/queryHelpers';
import { TimePeriod } from '@/types/common-type';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tNotif = useTranslations('notifications');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');
  const queryClient = useQueryClient();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; fullName: string } | null>(null);
  const [overduePageIndex, setOverduePageIndex] = useState(0);
  const [overduePageSize, setOverduePageSize] = useState(10);

  // Sử dụng TanStack Query hooks
  const {
    data: statsData,
    isLoading: isLoadingStats,
    error: statsError,
  } = useDashboardStats();

  const {
    data: revenueData = [],
    isLoading: isLoadingRevenue,
    error: revenueError,
  } = useDashboardRevenueData(selectedPeriod);

  const {
    data: topClasses = [],
    isLoading: isLoadingTopClasses,
    error: topClassesError,
  } = useTop3ClassesByRevenue();

  const {
    data: overdueStudentsPage,
    isLoading: isLoadingOverdueStudents,
    error: overdueStudentsError,
  } = useStudentsWithUnpaidFees(overduePageIndex, overduePageSize);

  const overdueStudents = overdueStudentsPage?.content ?? [];

  const handleOpenPayment = (student: { id: string; fullName: string }) => {
    setSelectedStudent(student);
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = async () => {
    // Refresh dashboard data after recording a payment
    await invalidateDashboard(queryClient);
    await invalidateTop3ClassesByRevenue(queryClient);
  };

  // Hiển thị error toast nếu có lỗi
  useEffect(() => {
    if (statsError) {
      toast.error(tNotif('errorLoadStats'));
    }
  }, [statsError, tNotif]);

  useEffect(() => {
    if (revenueError) {
      toast.error(tNotif('errorLoadRevenueData'));
    }
  }, [revenueError, tNotif]);

  useEffect(() => {
    if (topClassesError) {
      toast.error(tNotif('errorLoadTopClasses'));
    }
  }, [topClassesError, tNotif]);

  useEffect(() => {
    if (overdueStudentsError) {
      toast.error(tNotif('errorLoadOverdueStudents'));
    }
  }, [overdueStudentsError, tNotif]);

  // Loading state - hiển thị loading cho toàn trang khi các phần chính đang load
  // Lưu ý: loading của bảng học sinh nợ sẽ được xử lý riêng trong component OverdueStudentsTable
  const isLoading = isLoadingStats || isLoadingTopClasses;

  // Default stats data nếu chưa load được
  const defaultStatsData = {
    totalRevenue: 0,
    totalClasses: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalSalaryExpense: 0,
    revenueGrowth: 0,
    studentGrowth: 0,
    salaryExpenseGrowth: 0,
  };

  if (isLoading) {
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
      <StatsCards statsData={statsData || defaultStatsData} formatCurrency={formatCurrency} />

      {/* Charts */}
      <RevenueChart
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        currentRevenueData={revenueData}
        formatCurrency={formatCurrency}
        isLoading={isLoadingRevenue}
        className="w-full"
      />

      {/* Top 3 Classes by Revenue Table */}
      <RecentClassesTable topClasses={topClasses} formatCurrency={formatCurrency} />

      {/* Overdue Students Table */}
      <OverdueStudentsTable
        students={overdueStudents}
        formatCurrency={formatCurrency}
        onPayment={handleOpenPayment}
        isLoading={isLoadingOverdueStudents}
        error={overdueStudentsError ? tNotif('errorLoadOverdueStudents') : undefined}
        pageIndex={overduePageIndex}
        pageSize={overduePageSize}
        totalItems={overdueStudentsPage?.totalElements}
        onPageChange={(page) => {
          setOverduePageIndex(page);
        }}
        onPageSizeChange={(size) => {
          setOverduePageIndex(0);
          setOverduePageSize(size);
        }}
      />

      <PaymentCalendarDialog
        open={paymentDialogOpen}
        onOpenChange={(open) => {
          setPaymentDialogOpen(open);
          if (!open) setSelectedStudent(null);
        }}
        student={selectedStudent}
        onPaymentSuccess={async () => {
          setPaymentDialogOpen(false);
          setSelectedStudent(null);
          await handlePaymentSuccess();
        }}
      />
    </div>
  );
}
