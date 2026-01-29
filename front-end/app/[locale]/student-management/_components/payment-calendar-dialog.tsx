'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PaymentStatusCalendar, PaymentMonthStatus } from '../[id]/_components/payment-status-calendar';
import { PaymentHistoryItem } from '../[id]/_components';
import { MonthPaymentStatus, CreateStudentPaymentData, PaymentResponse } from '@/types';
import { useTranslations } from 'next-intl';
import { PageLoading } from '@/components/page-loading';
import { useStudent } from '@/hooks/use-students';
import { useCreateStudentPayment, usePaymentsByStudent } from '@/hooks/use-payments';
import { toast } from 'react-toastify';

interface PaymentCalendarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: { id: string; fullName: string } | null;
  onPaymentSuccess?: () => void;
}

// Convert MonthPaymentStatus from API to PaymentMonthStatus for component
const convertToPaymentMonthStatus = (apiPayments: MonthPaymentStatus[]): PaymentMonthStatus[] => {
  return apiPayments.map((payment) => {
    const date = new Date(payment.month);
    const month = date.getMonth() + 1; // JavaScript months are 0-indexed
    const year = date.getFullYear();

    // Convert status from API format (PAID, PARTIAL, UNPAID) to component format (paid, partial, unpaid)
    const statusMap: Record<string, 'paid' | 'unpaid' | 'partial'> = {
      PAID: 'paid',
      PARTIAL: 'partial',
      UNPAID: 'unpaid',
    };

    return {
      month,
      year,
      status: statusMap[payment.status] || 'unpaid',
      amount: payment.expectedAmount,
      paidAmount: payment.paidAmount,
      dueDate: payment.month, // Using month as dueDate for reference
    };
  });
};

// Convert PaymentResponse from API to PaymentHistoryItem for component
const convertToPaymentHistoryItem = (apiPayment: PaymentResponse): PaymentHistoryItem => {
  const billingDate = new Date(apiPayment.billingMonth);
  const month = billingDate.getMonth() + 1;
  const year = billingDate.getFullYear();
  const period = `Tháng ${month}/${year}`;

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
  const studentId = student?.id ?? '';

  const { data: studentData, isLoading: isLoadingStudent } = useStudent(studentId);
  const { data: payments = [], isLoading: isLoadingPayments } = usePaymentsByStudent(studentId);
  const createStudentPayment = useCreateStudentPayment();

  // Convert API monthPaymentStatuses to component format
  const monthlyPayments: PaymentMonthStatus[] =
    studentData?.monthPaymentStatuses && studentData.monthPaymentStatuses.length > 0
      ? convertToPaymentMonthStatus(studentData.monthPaymentStatuses)
      : [];

  const paymentHistory: PaymentHistoryItem[] =
    payments && payments.length > 0
      ? (payments as PaymentResponse[])
          .map(convertToPaymentHistoryItem)
          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      : [];

  // Handle payment submit from calendar
  const handlePaymentSubmit = async (data: CreateStudentPaymentData) => {
    try {
      if (!studentData?.class?.monthlyFee) {
        toast.error(tNotif('errorGetFeeInfo'));
        return;
      }

      await createStudentPayment.mutateAsync({
        data,
        monthlyFee: studentData.class.monthlyFee,
      });

      // Call success callback if provided
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
            <div className="py-8">
              <PageLoading />
            </div>
          ) : studentData ? (
            <div className="-mx-4 sm:-mx-6">
              <PaymentStatusCalendar
                monthlyPayments={monthlyPayments}
                monthlyFee={studentData?.class?.monthlyFee || 0}
                studentId={studentData?.id}
                paymentHistory={paymentHistory}
                onPaymentSubmit={handlePaymentSubmit}
                isSubmittingPayment={createStudentPayment.isPending}
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

