'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/utils/helper';
import { useState, useMemo } from 'react';
import { TeacherMonthlySalaryDialog } from './teacher-monthly-salary-dialog';
import { TeacherSalaryDetailDialog } from './teacher-salary-detail-dialog';
import { PaymentResponse, SalaryMonthStatus } from '@/types';

interface TeacherSalaryPaymentCalendarProps {
  monthlySalaries: SalaryMonthStatus[];
  baseSalary: number; // Lương cơ bản của giáo viên
  teacherId?: string;
  paymentHistory?: PaymentResponse[];
  onPaymentSubmit?: (data: {
    teacherId: string;
    month: number;
    year: number;
    baseSalary: number;
    bonus: number;
    deduction: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => void;
}

export function TeacherSalaryPaymentCalendar({
  monthlySalaries,
  baseSalary,
  teacherId,
  paymentHistory = [],
  onPaymentSubmit,
}: TeacherSalaryPaymentCalendarProps) {
  const t = useTranslations('teacher-detail');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Get available years from salaries, always include current year
  const availableYears = useMemo(() => {
    const years = new Set([...monthlySalaries.map((s) => s.year), currentYear]);
    return Array.from(years).sort((a, b) => b - a);
  }, [monthlySalaries, currentYear]);

  // Default to current year
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryMonthStatus | null>(null);

  const getStatusBadge = (status: string, totalAmount?: number, paidAmount?: number) => {
    const variants: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
      paid: {
        label: t('paid'),
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      unpaid: {
        label: t('unpaid'),
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      partial: {
        label: t('partial') || 'Trả một phần',
        icon: CheckCircle,
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
    };
    const variant = variants[status] || variants.unpaid;
    const Icon = variant.icon;

    return (
      <div className="flex flex-col items-center gap-2">
        <Badge className={variant.className} variant="outline">
          <Icon className="size-3 mr-1" />
          {variant.label}
        </Badge>
        {status === 'partial' && totalAmount && paidAmount && (
          <div className="text-xs text-center">
            <div className="text-slate-600 dark:text-slate-400">
              {formatCurrency(paidAmount)} / {formatCurrency(totalAmount)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Get month names
  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const monthKey = `month${i + 1}` as const;
    return t(monthKey) || `Tháng ${i + 1}`;
  });

  // Filter salaries by selected year
  const filteredSalaries = monthlySalaries.filter((s) => s.year === selectedYear);

  // Group by month for selected year
  const salariesByMonth = filteredSalaries.reduce(
    (acc, salary) => {
      acc[salary.month] = salary;
      return acc;
    },
    {} as Record<number, SalaryMonthStatus>,
  );

  // Calculate statistics for selected year
  const yearPaid = filteredSalaries.filter((s) => s.status === 'paid').length;
  const yearUnpaid = filteredSalaries.filter((s) => s.status === 'unpaid').length;
  const yearPartial = filteredSalaries.filter((s) => s.status === 'partial').length;

  // Handle month item click
  const handleMonthClick = (month: number, salary: SalaryMonthStatus | undefined) => {
    if (!teacherId) return;

    // If no salary data exists, create a new salary status for this month
    if (!salary) {
      const newSalary: SalaryMonthStatus = {
        month,
        year: selectedYear,
        status: 'unpaid',
        baseSalary: baseSalary,
        bonus: 0,
        deduction: 0,
        totalAmount: baseSalary,
        paidAmount: 0,
      };
      setSelectedSalary(newSalary);
      setPaymentDialogOpen(true);
      return;
    }

    // If salary is paid, show detail dialog
    if (salary.status === 'paid') {
      setSelectedSalary(salary);
      setDetailDialogOpen(true);
      return;
    }

    // If salary is unpaid or partial, show payment dialog
    if (salary.status === 'unpaid' || salary.status === 'partial') {
      setSelectedSalary(salary);
      setPaymentDialogOpen(true);
      return;
    }
  };

  // Handle payment submit from dialog
  const handleDialogSubmit = (data: {
    month: number;
    year: number;
    baseSalary: number;
    bonus: number;
    deduction: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => {
    if (teacherId && onPaymentSubmit) {
      onPaymentSubmit({
        teacherId,
        ...data,
      });
      setPaymentDialogOpen(false);
      setSelectedSalary(null);
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar className="size-5 md:size-6 text-indigo-600 dark:text-indigo-400" />
            {t('salaryPaymentCalendar') || 'Lịch Trả Lương'}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year: number) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="size-4 text-green-600" />
                <span className="text-slate-600 dark:text-slate-400">
                  {t('paid')}: <span className="font-bold text-green-600">{yearPaid}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="size-4 text-red-600" />
                <span className="text-slate-600 dark:text-slate-400">
                  {t('unpaid')}: <span className="font-bold text-red-600">{yearUnpaid}</span>
                </span>
              </div>
              {yearPartial > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4 text-orange-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {t('partial') || 'Trả một phần'}: <span className="font-bold text-orange-600">{yearPartial}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('baseSalary') || 'Lương cơ bản'}:{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(baseSalary)}</span>
        </div> */}
      </CardHeader>
      <CardContent>
        <div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
              const salary = salariesByMonth[month];
              const isCurrentMonth = selectedYear === currentYear && month === currentMonth;
              return (
                <div
                  key={`${selectedYear}-${month}`}
                  onClick={() => handleMonthClick(month, salary)}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    isCurrentMonth
                      ? 'border-indigo-300 dark:border-indigo-700 bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 shadow-md hover:shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md'
                  }`}
                >
                  <div className="text-center mb-3">
                    <div
                      className={`text-sm font-semibold ${
                        isCurrentMonth ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {monthNames[month - 1]}
                      {isCurrentMonth && (
                        <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(Hiện tại)</span>
                      )}
                    </div>
                  </div>
                  {salary ? (
                    <div className="flex flex-col items-center gap-2">
                      {getStatusBadge(salary.status, salary.totalAmount, salary.paidAmount)}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Badge
                        variant="outline"
                        className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                      >
                        {t('noData')}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>

      {/* Payment Dialog */}
      <TeacherMonthlySalaryDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        salary={selectedSalary}
        baseSalary={baseSalary}
        monthNames={monthNames}
        onSubmit={handleDialogSubmit}
      />

      {/* Salary Detail Dialog */}
      {selectedSalary && selectedSalary.status === 'paid' && (
        <TeacherSalaryDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          salary={selectedSalary}
          baseSalary={baseSalary}
          monthNames={monthNames}
          paymentHistory={paymentHistory}
        />
      )}
    </Card>
  );
}
