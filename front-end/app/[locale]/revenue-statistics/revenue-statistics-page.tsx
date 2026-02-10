'use client';

import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import { formatCurrency } from '@/utils/helper';
import {
  RevenueByClassChart,
  RevenueByPaymentMethodChart,
  RevenueByStatusChart,
} from './_components';
import {
  useDashboardRevenueData,
  useRevenueByClass,
  useRevenueByPaymentMethod,
  useRevenueByStatus,
} from '@/hooks/use-dashboard';
import { RevenueChart } from '@/app/[locale]/dashboard/_components/revenue-chart';
import { PageLoading } from '@/components/page-loading';
import { toast } from 'react-toastify';

type TimePeriod = '3months' | '6months' | '12months';

export default function RevenueStatisticsPage() {
  const t = useTranslations('revenue-statistics');
  const tNotif = useTranslations('notifications');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');

  // Fetch all revenue statistics data
  const {
    data: revenueData = [],
    isLoading: isLoadingRevenue,
    error: revenueError,
  } = useDashboardRevenueData(selectedPeriod);

  const {
    data: revenueByClass = [],
    isLoading: isLoadingByClass,
    error: byClassError,
  } = useRevenueByClass(selectedPeriod);

  const {
    data: revenueByPaymentMethod = [],
    isLoading: isLoadingByPaymentMethod,
    error: byPaymentMethodError,
  } = useRevenueByPaymentMethod(selectedPeriod);

  const {
    data: revenueByStatus = [],
    isLoading: isLoadingByStatus,
    error: byStatusError,
  } = useRevenueByStatus(selectedPeriod);

  // Show error toasts
  useEffect(() => {
    if (revenueError) {
      toast.error(tNotif('errorLoadRevenueData'));
    }
  }, [revenueError, tNotif]);

  useEffect(() => {
    if (byClassError) {
      toast.error(t('errorLoadByClass'));
    }
  }, [byClassError, t]);

  useEffect(() => {
    if (byPaymentMethodError) {
      toast.error(t('errorLoadByPaymentMethod'));
    }
  }, [byPaymentMethodError, t]);

  useEffect(() => {
    if (byStatusError) {
      toast.error(t('errorLoadByStatus'));
    }
  }, [byStatusError, t]);

  const isLoading =
    isLoadingRevenue || isLoadingByClass || isLoadingByPaymentMethod || isLoadingByStatus;

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
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">{t('description')}</p>
        </div>
      </div>

      {/* Revenue vs Expense Chart (from dashboard) */}
      <RevenueChart
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        currentRevenueData={revenueData}
        formatCurrency={formatCurrency}
        isLoading={isLoadingRevenue}
        className="w-full"
      />

      {/* Revenue by Class Chart */}
      <RevenueByClassChart
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        data={revenueByClass}
        formatCurrency={formatCurrency}
        isLoading={isLoadingByClass}
        className="w-full"
      />

      {/* Two column layout for Payment Method and Status */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue by Payment Method Chart */}
        <RevenueByPaymentMethodChart
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          data={revenueByPaymentMethod}
          formatCurrency={formatCurrency}
          isLoading={isLoadingByPaymentMethod}
          className="w-full"
        />

        {/* Revenue by Status Chart */}
        <RevenueByStatusChart
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          data={revenueByStatus}
          formatCurrency={formatCurrency}
          isLoading={isLoadingByStatus}
          className="w-full"
        />
      </div>
    </div>
  );
}

