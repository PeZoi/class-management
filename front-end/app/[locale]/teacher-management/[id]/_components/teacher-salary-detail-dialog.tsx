'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatCurrency, formatDateTime } from '@/utils/helper';
import { ArrowLeftRight, Banknote, Calendar, CheckCircle, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SalaryMonthStatus } from './teacher-salary-payment-calendar';
import { PaymentResponse } from '@/types';

interface TeacherSalaryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salary: SalaryMonthStatus;
  baseSalary: number;
  monthNames: string[];
  paymentHistory?: PaymentResponse[];
}

export function TeacherSalaryDetailDialog({
  open,
  onOpenChange,
  salary,
  baseSalary,
  monthNames,
  paymentHistory = [],
}: TeacherSalaryDetailDialogProps) {
  const t = useTranslations('teacher-detail');
  const tPayment = useTranslations('payment-management');

  // Filter payment history for this specific month/year
  const monthPayments = paymentHistory.filter((p) => {
    if (!p.billingMonth) return false;
    const billingDate = new Date(p.billingMonth);
    const paymentMonth = billingDate.getMonth() + 1;
    const paymentYear = billingDate.getFullYear();
    return paymentMonth === salary.month && paymentYear === salary.year;
  });

  // Sort by createdAt (most recent first)
  monthPayments.sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const getPaymentMethodBadge = (method: string) => {
    const methods: Record<string, { label: string; className: string; icon: typeof Banknote }> = {
      CASH: {
        label: tPayment('method_cash') || 'Tiền mặt',
        className:
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: Banknote,
      },
      BANK_TRANSFER: {
        label: tPayment('method_bank_transfer') || 'Chuyển khoản',
        className:
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: ArrowLeftRight,
      },
    };
    const methodConfig = methods[method] || methods.CASH;
    const Icon = methodConfig.icon;
    return (
      <Badge variant="outline" className={methodConfig.className}>
        <Icon className="size-3 mr-1" />
        {methodConfig.label}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="size-6 text-green-600" />
            Chi Tiết Thanh Toán Lương
          </DialogTitle>
          <DialogDescription>
            {`Thông tin thanh toán lương cho tháng ${monthNames[salary.month - 1]} ${salary.year}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Salary Summary */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tổng Quan</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Tháng:</span>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {monthNames[salary.month - 1]} {salary.year}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Tổng lương:</span>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(salary.totalAmount || baseSalary)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Lương cơ bản:</span>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(salary.baseSalary || baseSalary)}
                </div>
              </div>
              {salary.bonus && salary.bonus > 0 && (
                <div>
                  <span className="text-slate-500">Thưởng:</span>
                  <div className="font-medium text-green-600 dark:text-green-400">
                    +{formatCurrency(salary.bonus)}
                  </div>
                </div>
              )}
              {salary.deduction && salary.deduction > 0 && (
                <div>
                  <span className="text-slate-500">Khấu trừ:</span>
                  <div className="font-medium text-red-600 dark:text-red-400">
                    -{formatCurrency(salary.deduction)}
                  </div>
                </div>
              )}
              <div>
                <span className="text-slate-500">Đã thanh toán:</span>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(salary.paidAmount || 0)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Trạng thái:</span>
                <div>
                  <Badge
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    variant="outline"
                  >
                    <CheckCircle className="size-3 mr-1" />
                    {t('paid') || 'Đã trả'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History */}
          {monthPayments.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="size-4" />
                Lịch Sử Thanh Toán (theo createdAt)
              </h3>
              <div className="space-y-3">
                {monthPayments.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
                            #{p.paymentId}
                          </span>
                          {getPaymentMethodBadge(p.paymentMethod)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="size-4" />
                          {p.createdAt ? formatDateTime(p.createdAt) : 'N/A'}
                        </div>
                        {p.bonus && p.bonus > 0 && (
                          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Thưởng: +{formatCurrency(p.bonus)}
                          </div>
                        )}
                        {p.deduction && p.deduction > 0 && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Khấu trừ: -{formatCurrency(p.deduction)}
                          </div>
                        )}
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(p.paid || 0)}
                      </div>
                    </div>
                    {p.note && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{p.note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-500 dark:text-slate-400">
              <p className="text-sm">Không có lịch sử thanh toán chi tiết</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

