'use client';

import { PageLoading } from '@/components/page-loading';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCreateSessionPayment, usePaymentsByStudent } from '@/hooks/use-payments';
import { useStudent } from '@/hooks/use-students';
import { invalidatePaymentsByStudent, invalidateStudent, invalidateStudentsByClass } from '@/lib/queryHelpers';
import { CreateSessionPaymentData, PaymentResponse, SessionPaymentStatus } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';
import { PaymentHistoryItem } from '../[id]/_components';
import { PaymentStatusCalendar } from '../[id]/_components/payment-status-calendar';

interface PaymentCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: { id: string; fullName: string } | null;
  onPaymentSuccess?: () => void;
}

// Convert PaymentResponse from API to PaymentHistoryItem for component
const convertToPaymentHistoryItem = (apiPayment: PaymentResponse, monthNames: string[]): PaymentHistoryItem => {
  const billingDate = new Date(apiPayment.billingMonth);
  const month = billingDate.getMonth() + 1;
  const year = billingDate.getFullYear();
  const period = `${monthNames[month - 1] || `Month ${month}`} ${year}`;

  // Convert payment method
  const paymentMethodMap: Record<string, 'cash' | 'bank_transfer'> = {
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer',
  };

  // Convert payment status
  const statusMap: Record<string, 'paid' | 'partial'> = {
    COMPLETED: 'paid',
    INCOMPLETE: 'partial',
  };

  return {
    id: apiPayment.id || apiPayment.paymentId,
    invoiceId: apiPayment.paymentId || `PAY-${apiPayment.id}`,
    paymentDate: apiPayment?.createdAt || new Date().toISOString(),
    amount: apiPayment.paid || 0,
    paymentMethod: paymentMethodMap[apiPayment.paymentMethod] || 'bank_transfer',
    status: statusMap[apiPayment.paymentStatus] || 'partial',
    period,
    notes: apiPayment.note,
    packageNumber: apiPayment.packageNumber,
  };
};

export function PaymentCalendarDialog({
  open,
  onOpenChange,
  student,
  onPaymentSuccess,
}: PaymentCalendarDialogProps) {
  const t = useTranslations('student-detail');
  const tNotif = useTranslations('notifications');
  const queryClient = useQueryClient();
  const studentId = student?.id ?? '';
  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const monthKey = `month${i + 1}` as const;
    return t(monthKey) || `Month ${i + 1}`;
  });

  const { data: studentData, isLoading: isLoadingStudent } = useStudent(studentId);
  const { data: payments = [], isLoading: isLoadingPayments } = usePaymentsByStudent(studentId);
  const createSessionPayment = useCreateSessionPayment();

  // Session-based payment statuses (package-based)
  const sessionPayments: SessionPaymentStatus[] = studentData?.sessionPaymentStatuses || [];

  const paymentHistory: PaymentHistoryItem[] =
    payments && payments.length > 0
      ? (payments as PaymentResponse[])
          .map((payment) => convertToPaymentHistoryItem(payment, monthNames))
          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      : [];

  // Handle payment submit from calendar (session/package-based)
  const handlePaymentSubmit = async (data: CreateSessionPaymentData) => {
    try {
      if (!studentData?.class?.monthlyFee) {
        toast.error(tNotif('errorGetFeeInfo'));
        return;
      }

      await createSessionPayment.mutateAsync({
        data,
        monthlyFee: studentData.class.monthlyFee,
      });

      // Invalidate related caches so lists refresh
      invalidateStudent(queryClient, studentId);
      invalidatePaymentsByStudent(queryClient, studentId);
      if (studentData.class?.id) {
        invalidateStudentsByClass(queryClient, studentData.class.id);
      }

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (error) {
      console.error('Lỗi khi ghi nhận thanh toán', error);
      // Toast đã được handle trong hook useCreateStudentPayment
    }
  };

  if (!student) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl xl:max-w-[90vw] 2xl:max-w-[85vw] max-h-[90vh] overflow-y-auto p-0 sm:p-6">
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            {t('paymentStatusCalendar')} - {student.fullName}
          </DialogTitle>
          <DialogDescription>
            {t('paymentStatusCalendarDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {isLoadingStudent || isLoadingPayments ? (
            <div className="py-8 overflow-hidden max-h-96 flex items-center justify-center">
              <PageLoading />
            </div>
          ) : studentData ? (
            <div className="-mx-4 sm:-mx-6">
              <PaymentStatusCalendar
                sessionPayments={sessionPayments}
                monthlyFee={studentData?.class?.monthlyFee || 0}
                studentId={studentData?.id}
                paymentHistory={paymentHistory}
                onPaymentSubmit={handlePaymentSubmit}
                isSubmittingPayment={createSessionPayment.isPending}
              />
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tNotif('errorLoadStudentInfo')}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

