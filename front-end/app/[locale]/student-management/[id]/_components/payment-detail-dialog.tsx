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
import { PaymentMonthStatus } from './payment-status-calendar';
import { PaymentHistoryItem } from './student-payment-history';

interface PaymentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentMonthStatus;
  monthlyFee: number;
  monthNames: string[];
  paymentHistory?: PaymentHistoryItem[];
}

export function PaymentDetailDialog({
  open,
  onOpenChange,
  payment,
  monthlyFee,
  monthNames,
  paymentHistory = [],
}: PaymentDetailDialogProps) {
  const t = useTranslations('student-detail');
  const tPayment = useTranslations('payment-management');

  // Filter payment history for this specific month/year
  const monthPayments = paymentHistory.filter((p) => {
    // Extract month and year from period string (e.g., "Tháng 12/2024")
    const match = p.period.match(/Tháng\s+(\d+)\/(\d+)/);
    if (match) {
      const periodMonth = parseInt(match[1]);
      const periodYear = parseInt(match[2]);
      return periodMonth === payment.month && periodYear === payment.year;
    }
    return false;
  });

  const getPaymentMethodBadge = (method: string) => {
    const methods: Record<string, { label: string; className: string; icon: typeof Banknote }> = {
      cash: {
        label: tPayment('method_cash') || 'Tiền mặt',
        className:
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: Banknote,
      },
      bank_transfer: {
        label: tPayment('method_bank_transfer') || 'Chuyển khoản',
        className:
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: ArrowLeftRight,
      },
    };
    const methodConfig = methods[method] || methods.cash;
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
            Chi Tiết Thanh Toán
          </DialogTitle>
          <DialogDescription>
            {`Thông tin thanh toán cho tháng ${monthNames[payment.month - 1]} ${payment.year}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Summary */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tổng Quan</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Tháng:</span>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {monthNames[payment.month - 1]} {payment.year}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Tổng học phí:</span>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(payment.amount || monthlyFee)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Đã thanh toán:</span>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(payment.paidAmount || 0)}
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
                    {t('statusPaid') || 'Đã đóng'}
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
                Lịch Sử Thanh Toán
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
                            #{p.invoiceId}
                          </span>
                          {getPaymentMethodBadge(p.paymentMethod)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Calendar className="size-4" />
                          {formatDateTime(p.paymentDate)}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(p.amount)}
                      </div>
                    </div>
                    {p.notes && (
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-sm text-slate-600 dark:text-slate-400">{p.notes}</p>
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

