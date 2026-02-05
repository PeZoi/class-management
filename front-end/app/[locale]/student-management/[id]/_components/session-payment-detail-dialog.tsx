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
import { ArrowLeftRight, Banknote, Calendar, CheckCircle, CreditCard, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SessionPaymentStatus } from '@/types';
import { PaymentHistoryItem } from './student-payment-history';

interface SessionPaymentDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: SessionPaymentStatus;
  monthlyFee: number;
  paymentHistory?: PaymentHistoryItem[];
}

export function SessionPaymentDetailDialog({
  open,
  onOpenChange,
  payment,
  monthlyFee,
  paymentHistory = [],
}: SessionPaymentDetailDialogProps) {
  const t = useTranslations('student-detail');
  const tPayment = useTranslations('payment-management');

  // Filter payment history for this specific package
  const packagePayments = paymentHistory.filter((p) => {
    // Extract package info from period or notes if available
    // For now, we'll match by checking if payment is within the session range
    // This is a simplified approach - you may need to adjust based on your data structure
    return true; // Placeholder - adjust based on your payment history structure
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
            {`Thông tin thanh toán cho Gói ${payment.packageNumber} (Buổi ${payment.startSessionNumber} - ${payment.endSessionNumber})`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Summary */}
          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Tổng Quan</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Gói thanh toán:</span>
                <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Package className="size-4" />
                  Gói {payment.packageNumber}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Phạm vi buổi học:</span>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  Buổi {payment.startSessionNumber} - {payment.endSessionNumber}
                </div>
              </div>
              <div>
                <span className="text-slate-500">Tổng học phí:</span>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  {formatCurrency(payment.expectedAmount)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">{t('paidAmount') || 'Đã đóng'}:</span>
                <div className="font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(payment.paidAmount || 0)}
                </div>
              </div>
              <div>
                <span className="text-slate-500">{t('statusLabel') || 'Trạng thái'}:</span>
                <div>
                  <Badge
                    className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    variant="outline"
                  >
                    <CheckCircle className="size-3 mr-1" />
                    {t('statusPaid') || 'Đã thanh toán'}
                  </Badge>
                </div>
              </div>
              {payment.completedAt && (
                <div>
                  <span className="text-slate-500">Hoàn thành:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {formatDateTime(payment.completedAt)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          {packagePayments.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="size-4" />
                {t('paymentHistory') || 'Lịch Sử Thanh Toán'}
              </h3>
              <div className="space-y-3">
                {packagePayments.map((p) => (
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
              <p className="text-sm">{t('noPaymentHistory') || 'Chưa có lịch sử thanh toán'}</p>
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

