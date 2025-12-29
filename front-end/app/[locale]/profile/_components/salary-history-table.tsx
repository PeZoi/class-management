import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/helper';
import {
  Activity,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SalaryPayment {
  id: number;
  paymentDate: string;
  period: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  status: 'paid' | 'pending';
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  notes: string;
}

interface SalaryHistoryTableProps {
  payments: SalaryPayment[];
  className?: string;
}

export function SalaryHistoryTable({ payments, className }: SalaryHistoryTableProps) {
  const t = useTranslations('profile');

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      cash: {
        label: t('method_cash'),
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      bank_transfer: {
        label: t('method_bank_transfer'),
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
      credit_card: {
        label: t('method_credit_card'),
        className: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      },
      e_wallet: {
        label: t('method_e_wallet'),
        className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      },
    };

    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.cash;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium', config.className)}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: 'paid' | 'pending') => {
    const statusConfig = {
      paid: {
        label: t('status_paid'),
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
      },
      pending: {
        label: t('status_pending'),
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: Clock,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.className)}>
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  };

  return (
    <Card
      className={cn(
        'hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg',
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">{t('salaryHistory')}</CardTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Lịch sử các khoản thanh toán lương của bạn
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  {t('paymentDate')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <FileText className="size-4" />
                  {t('period')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="size-4" />
                  {t('baseSalary')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <TrendingUp className="size-4" />
                  {t('bonus')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <TrendingDown className="size-4" />
                  {t('deduction')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <CreditCard className="size-4" />
                  {t('totalAmount')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="size-4" />
                  {t('method')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Activity className="size-4" />
                  {t('status')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <FileText className="size-4" />
                  {t('notes')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-slate-500">
                  {t('noPaymentHistory')}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow
                  key={payment.id}
                  className={cn('transition-colors')}
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-slate-500" />
                      {formatDateTime(payment.paymentDate)}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-medium">
                      {payment.period}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(payment.baseSalary)}
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.bonus > 0 ? (
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        +{formatCurrency(payment.bonus)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {payment.deduction > 0 ? (
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        -{formatCurrency(payment.deduction)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                      {formatCurrency(payment.totalAmount)}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{getPaymentMethodBadge(payment.method)}</TableCell>
                  <TableCell className="text-center">{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {payment.notes || <span className="text-slate-400">-</span>}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

