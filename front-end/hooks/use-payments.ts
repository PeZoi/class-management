import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'react-toastify';

import { invalidateDashboard, invalidatePaymentsByStudent, invalidatePaymentsByTeacher, invalidateStudent, invalidateStudentLists, invalidateTeacher } from '@/lib/queryHelpers';
import { queryKeys } from '@/lib/queryKeys';
import { paymentService } from '@/services/payment-service';
import { formatCurrency } from '@/utils/helper';
import { CreateStudentPaymentData, CreateTeacherPaymentData, PaymentResponse } from '@/types';

/**
 * Hook để lấy tất cả payments (payment management list)
 */
export function usePayments() {
  return useQuery<PaymentResponse[]>({
    queryKey: queryKeys.payments.list(),
    queryFn: async () => {
      const response = await paymentService.getAllPayments();
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch payments');
    },
  });
}

/**
 * Hook để lấy payment history theo studentId
 */
export function usePaymentsByStudent(studentId: string) {
  return useQuery<PaymentResponse[]>({
    queryKey: queryKeys.payments.byStudent(studentId),
    queryFn: async () => {
      const response = await paymentService.getPaymentsByStudentId(studentId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch payments by student');
    },
    enabled: !!studentId,
  });
}

/**
 * Hook để lấy payment history theo teacherId
 */
export function usePaymentsByTeacher(teacherId: string) {
  return useQuery<PaymentResponse[]>({
    queryKey: queryKeys.payments.byTeacher(teacherId),
    queryFn: async () => {
      const response = await paymentService.getPaymentsByTeacherId(teacherId);
      if (response.status === 200 && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch payments by teacher');
    },
    enabled: !!teacherId,
  });
}

/**
 * Hook để tạo payment học phí cho học viên (từ calendar)
 * - auto download invoice (best-effort)
 * - invalidate student detail + payments by student + dashboard
 */
export function useCreateStudentPayment() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: async (params: {
      data: CreateStudentPaymentData;
      monthlyFee: number;
    }) => {
      const { data, monthlyFee } = params;
      const response = await paymentService.createStudentPayment(data, monthlyFee);
      if (response.status !== 201 || !response.data) {
        throw new Error('Failed to create student payment');
      }
      return response.data;
    },
    onSuccess: async (payment, variables) => {
      // Toast success
      toast.success(
        tNotif('successRecordPayment', {
          amount: formatCurrency(variables.data.amount),
          month: variables.data.month,
          year: variables.data.year,
        }),
      );

      // Auto download invoice (best-effort)
      const paymentId = (payment as { paymentId?: string; id?: string })?.paymentId || (payment as { id?: string })?.id;
      if (paymentId) {
        try {
          await paymentService.downloadInvoiceAndSave(paymentId, `${paymentId}.pdf`);
        } catch (error) {
          // Don't interrupt flow
          console.error('Error downloading invoice:', error);
        }
      }

      // Invalidate related data
      invalidatePaymentsByStudent(queryClient, variables.data.studentId);
      invalidateStudent(queryClient, variables.data.studentId);
      invalidateStudentLists(queryClient);
      invalidateDashboard(queryClient);

      // Safe: invalidate all payments queries too (list pages, etc.)
      await queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
    onError: (error) => {
      console.error('Error creating student payment:', error);
      toast.error(tNotif('errorRecordPayment'));
    },
  });
}

/**
 * Hook để trả lương cho giáo viên (từ calendar)
 * - auto download invoice (best-effort)
 * - invalidate payments by teacher + teacher detail + dashboard
 */
export function useCreateTeacherPayment() {
  const queryClient = useQueryClient();
  const tNotif = useTranslations('notifications');

  return useMutation({
    mutationFn: async (data: CreateTeacherPaymentData) => {
      const response = await paymentService.createTeacherPayment(data);
      if (response.status !== 201 || !response.data) {
        throw new Error('Failed to create teacher payment');
      }
      return response.data;
    },
    onSuccess: async (payment, variables) => {
      toast.success(tNotif('successPaySalary'));

      const paymentId =
        (payment as { paymentId?: string; id?: string })?.paymentId ||
        (payment as { id?: string })?.id;
      if (paymentId) {
        try {
          await paymentService.downloadInvoiceAndSave(paymentId, `${paymentId}.pdf`);
        } catch (error) {
          console.error('Error downloading invoice:', error);
        }
      }

      invalidatePaymentsByTeacher(queryClient, variables.teacherId);
      invalidateTeacher(queryClient, variables.teacherId);
      invalidateDashboard(queryClient);
      await queryClient.invalidateQueries({ queryKey: queryKeys.payments.all });
    },
    onError: (error) => {
      console.error('Error creating teacher payment:', error);
      toast.error(tNotif('errorPaySalary'));
    },
  });
}


