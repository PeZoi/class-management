'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, DollarSign, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '@/utils/helper';
import { useState } from 'react';
import { SessionPaymentStatus } from '@/types';
import { SessionPaymentDialog } from './session-payment-dialog';
import { SessionPaymentDetailDialog } from './session-payment-detail-dialog';
import { PaymentHistoryItem } from './student-payment-history';

interface SessionPaymentListProps {
  sessionPayments: SessionPaymentStatus[];
  monthlyFee: number;
  studentId?: string;
  paymentHistory?: PaymentHistoryItem[];
  onPaymentSubmit?: (data: {
    studentId: string;
    packageNumber: number;
    startSessionNumber: number;
    endSessionNumber: number;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => void;
  isSubmittingPayment?: boolean;
}

export function SessionPaymentList({
  sessionPayments,
  monthlyFee,
  studentId,
  paymentHistory = [],
  onPaymentSubmit,
  isSubmittingPayment,
}: SessionPaymentListProps) {
  const t = useTranslations('student-detail');
  
  // Payment dialog state
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SessionPaymentStatus | null>(null);

  const getStatusBadge = (status: SessionPaymentStatus['status'], amount?: number, paidAmount?: number) => {
    const variants: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
      PAID: {
        label: t('statusPaid'),
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      UNPAID: {
        label: t('statusUnpaid'),
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      PARTIAL: {
        label: t('statusPartial'),
        icon: CheckCircle,
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
    };
    const variant = variants[status] || variants.UNPAID;
    const Icon = variant.icon;

    return (
      <div className="flex flex-col items-center gap-2">
        <Badge className={variant.className} variant="outline">
          <Icon className="size-3 mr-1" />
          {variant.label}
        </Badge>
        {status === 'PARTIAL' && amount && paidAmount !== undefined && (
          <div className="text-xs text-center">
            <div className="text-slate-600 dark:text-slate-400">
              {formatCurrency(paidAmount)} / {formatCurrency(amount)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Calculate statistics
  const paidCount = sessionPayments.filter((p) => p.status === 'PAID').length;
  const unpaidCount = sessionPayments.filter((p) => p.status === 'UNPAID').length;
  const partialCount = sessionPayments.filter((p) => p.status === 'PARTIAL').length;

  // Handle package click
  const handlePackageClick = (payment: SessionPaymentStatus) => {
    if (!studentId) return;

    // If payment is paid, show detail dialog
    if (payment.status === 'PAID') {
      setSelectedPayment(payment);
      setDetailDialogOpen(true);
      return;
    }

    // If payment is unpaid or partial, show payment dialog
    if (payment.status === 'UNPAID' || payment.status === 'PARTIAL') {
      setSelectedPayment(payment);
      setPaymentDialogOpen(true);
      return;
    }
  };

  // Handle payment submit from dialog
  const handleDialogSubmit = (data: {
    packageNumber: number;
    startSessionNumber: number;
    endSessionNumber: number;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => {
    if (studentId && onPaymentSubmit) {
      onPaymentSubmit({
        studentId,
        ...data,
      });
      setPaymentDialogOpen(false);
      setSelectedPayment(null);
    }
  };

  return (
    <Card className="transition-all duration-300 border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold flex items-center gap-2">
            <Package className="size-5 md:size-6 text-indigo-600 dark:text-indigo-400" />
            {t('sessionPaymentStatus')}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-4 text-green-600" />
              <span className="text-slate-600 dark:text-slate-400">
                {t('paid')}: <span className="font-bold text-green-600">{paidCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="size-4 text-red-600" />
              <span className="text-slate-600 dark:text-slate-400">
                {t('unpaid')}: <span className="font-bold text-red-600">{unpaidCount}</span>
              </span>
            </div>
            {partialCount > 0 && (
              <div className="flex items-center gap-2">
                <DollarSign className="size-4 text-orange-600" />
                <span className="text-slate-600 dark:text-slate-400">
                  {t('partial')}: <span className="font-bold text-orange-600">{partialCount}</span>
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t('monthlyFee')}:{' '}
          <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(monthlyFee)}</span>
          <span className="ml-2 text-xs">({t('sessionsPerPackage')})</span>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {sessionPayments.length === 0 ? (
          <div className="text-center py-8">
            <Package className="size-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('noPaymentData')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionPayments.map((payment) => {
              const isCurrentPackage = payment.status === 'UNPAID' || payment.status === 'PARTIAL';
              return (
                <div
                  key={`package-${payment.packageNumber}`}
                  onClick={() => handlePackageClick(payment)}
                  className={`p-4 border rounded-lg transition-all cursor-pointer ${
                    isCurrentPackage
                      ? 'border-indigo-300 dark:border-indigo-700 bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 shadow-md hover:shadow-lg'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-md'
                  }`}
                >
                  <div className="text-center mb-3">
                    <div
                      className={`text-sm font-semibold ${
                        isCurrentPackage
                          ? 'text-indigo-900 dark:text-indigo-100'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      <Package className="size-4 inline mr-1" />
                      {t('packageLabel')} {payment.packageNumber}
                      {isCurrentPackage && (
                        <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                          ({t('current')})
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      {t('sessionLabel')} {payment.startSessionNumber} - {payment.endSessionNumber}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {getStatusBadge(payment.status, payment.expectedAmount, payment.paidAmount)}
                    {payment.status !== 'PAID' && (
                      <div className="text-xs text-center text-slate-600 dark:text-slate-400 mt-1">
                        {t('remaining')}: <span className="font-bold">{formatCurrency(payment.remainingAmount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Payment Dialog */}
      <SessionPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        payment={selectedPayment}
        monthlyFee={monthlyFee}
        onSubmit={handleDialogSubmit}
        isSubmitting={isSubmittingPayment}
      />

      {/* Payment Detail Dialog */}
      {selectedPayment && selectedPayment.status === 'PAID' && (
        <SessionPaymentDetailDialog
          open={detailDialogOpen}
          onOpenChange={setDetailDialogOpen}
          payment={selectedPayment}
          monthlyFee={monthlyFee}
          paymentHistory={paymentHistory}
        />
      )}
    </Card>
  );
}

