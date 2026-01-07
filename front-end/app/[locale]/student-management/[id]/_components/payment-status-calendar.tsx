'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/utils/helper';
import { useState } from 'react';

export interface PaymentMonthStatus {
  month: number; // 1-12
  year: number;
  status: 'paid' | 'unpaid' | 'partial';
  amount?: number;
  paidAmount?: number;
  dueDate?: string;
}

interface PaymentStatusCalendarProps {
  monthlyPayments: PaymentMonthStatus[];
  monthlyFee: number;
}

export function PaymentStatusCalendar({ monthlyPayments, monthlyFee }: PaymentStatusCalendarProps) {
  const t = useTranslations('student-detail');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Get available years from payments
  const availableYears = Array.from(
    new Set(monthlyPayments.map((p) => p.year))
  ).sort((a, b) => b - a);

  // Default to current year if available, otherwise use the most recent year
  const defaultYear = availableYears.includes(currentYear) ? currentYear : availableYears[0] || currentYear;
  const [selectedYear, setSelectedYear] = useState(defaultYear);

  const getStatusBadge = (status: string, amount?: number, paidAmount?: number) => {
    const variants: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
      paid: {
        label: t('statusPaid') || 'Đã đóng',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      unpaid: {
        label: t('statusUnpaid') || 'Chưa đóng',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      partial: {
        label: t('statusPartial') || 'Đóng một phần',
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
        {status === 'partial' && amount && paidAmount && (
          <div className="text-xs text-center">
            <div className="text-slate-600 dark:text-slate-400">
              {formatCurrency(paidAmount)} / {formatCurrency(amount)}
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

  // Filter payments by selected year
  const filteredPayments = monthlyPayments.filter((p) => p.year === selectedYear);

  // Group by month for selected year
  const paymentsByMonth = filteredPayments.reduce((acc, payment) => {
    acc[payment.month] = payment;
    return acc;
  }, {} as Record<number, PaymentMonthStatus>);

  // Calculate statistics for selected year
  const yearPaid = filteredPayments.filter((p) => p.status === 'paid').length;
  const yearUnpaid = filteredPayments.filter((p) => p.status === 'unpaid').length;
  const yearPartial = filteredPayments.filter((p) => p.status === 'partial').length;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar className="size-5 md:size-6 text-indigo-600 dark:text-indigo-400" />
            {t('paymentStatusCalendar')}
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
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
                    {t('partial')}: <span className="font-bold text-orange-600">{yearPartial}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('monthlyFee')}: <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(monthlyFee)}</span>
        </div>
      </CardHeader>
      <CardContent>
        {availableYears.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noPaymentData')}</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const payment = paymentsByMonth[month];
                const isCurrentMonth = selectedYear === currentYear && month === currentMonth;
                return (
                  <div
                    key={`${selectedYear}-${month}`}
                    className={`p-4 border rounded-lg transition-colors ${
                      isCurrentMonth
                        ? 'border-indigo-300 dark:border-indigo-700 bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-center mb-3">
                      <div
                        className={`text-sm font-semibold ${
                          isCurrentMonth
                            ? 'text-indigo-900 dark:text-indigo-100'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {monthNames[month - 1]}
                        {isCurrentMonth && (
                          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">(Hiện tại)</span>
                        )}
                      </div>
                    </div>
                    {payment ? (
                      getStatusBadge(payment.status, payment.amount, payment.paidAmount)
                    ) : (
                      <div className="text-center">
                        <Badge variant="outline" className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {t('noData')}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
