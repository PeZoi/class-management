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
import { StudentType, MonthPaymentStatus, CreateStudentPaymentData, PaymentResponse } from '@/types';
import { studentService, paymentService } from '@/services';
import { toast } from 'react-toastify';
import { useEffect, useState, useMemo } from 'react';
import { formatCurrency } from '@/utils/helper';
import { useTranslations } from 'next-intl';
import { PageLoading } from '@/components/page-loading';

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
  const [studentData, setStudentData] = useState<StudentType | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert API monthPaymentStatuses to component format
  const monthlyPayments = useMemo(() => {
    if (studentData?.monthPaymentStatuses && studentData.monthPaymentStatuses.length > 0) {
      return convertToPaymentMonthStatus(studentData.monthPaymentStatuses);
    }
    // Fallback to empty array if no data
    return [];
  }, [studentData?.monthPaymentStatuses]);

  // Fetch student data when dialog opens
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!student?.id || !open) return;

      setLoading(true);
      try {
        const response = await studentService.getStudentById(student.id);
        if (response.status === 200 && response.data) {
          setStudentData(response.data);
        } else {
          toast.error(tNotif('errorLoadStudentInfo'));
        }
      } catch (error) {
        console.error('Lỗi fetch thông tin học viên', error);
        toast.error(tNotif('errorLoadStudentInfo'));
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [student?.id, open]);

  // Fetch payment history when dialog opens
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!student?.id || !open) return;

      try {
        const response = await paymentService.getPaymentsByStudentId(student.id);
        if (response.status === 200 && response.data) {
          const convertedHistory = response.data.map(convertToPaymentHistoryItem).sort((a, b) => {
            return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
          });
          setPaymentHistory(convertedHistory);
        }
      } catch (error) {
        console.error('Lỗi fetch lịch sử thanh toán', error);
        // Don't show error toast, just log it
      }
    };

    fetchPaymentHistory();
  }, [student?.id, open]);

  // Handle payment submit from calendar
  const handlePaymentSubmit = async (data: CreateStudentPaymentData) => {
    try {
      if (!studentData?.class?.monthlyFee) {
        toast.error(tNotif('errorGetFeeInfo'));
        return;
      }

      // Call API to create payment
      const response = await paymentService.createStudentPayment(data, studentData.class.monthlyFee);

      if (response.status === 201 && response.data) {
        toast.success(tNotif('successRecordPayment', { amount: formatCurrency(data.amount), month: data.month, year: data.year }));

        // Tự động tải hóa đơn PDF
        if (response.data.paymentId || response.data.id) {
          try {
            const paymentId = response.data.paymentId || response.data.id;
            await paymentService.downloadInvoiceAndSave(paymentId, `HoaDon_${paymentId}.pdf`);
          } catch (error) {
            console.error('Lỗi khi tải hóa đơn:', error);
            // Không hiển thị lỗi để không làm gián đoạn flow
          }
        }

        // Refresh student data to update payment status
        const studentResponse = await studentService.getStudentById(data.studentId);
        if (studentResponse.status === 200 && studentResponse.data) {
          setStudentData(studentResponse.data);
        }

        // Refresh payment history
        const paymentHistoryResponse = await paymentService.getPaymentsByStudentId(data.studentId);
        if (paymentHistoryResponse.status === 200 && paymentHistoryResponse.data) {
          const convertedHistory = paymentHistoryResponse.data.map(convertToPaymentHistoryItem).sort((a, b) => {
            return new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime();
          });
          setPaymentHistory(convertedHistory);
        }

        // Call success callback if provided
        if (onPaymentSuccess) {
          onPaymentSuccess();
        }
      } else {
        toast.error(tNotif('errorRecordPayment'));
      }
    } catch (error) {
      console.error('Lỗi khi ghi nhận thanh toán', error);
      toast.error(tNotif('errorRecordPayment'));
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
          {loading ? (
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
              />
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Không thể tải thông tin học viên
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

