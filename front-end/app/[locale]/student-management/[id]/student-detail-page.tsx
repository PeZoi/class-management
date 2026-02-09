'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import {
  StudentDetailHeader,
  StudentPersonalInfo,
  StudentParentInfo,
  StudentClassInfo,
  StudentClassHistory,
  StudentPaymentHistory,
  SessionPaymentList,
  StudentAttendanceSessions,
  ClassHistoryItem,
  PaymentHistoryItem,
} from './_components';
import { CreateSessionPaymentData, PaymentResponse, ClassHistoryResponse, SessionPaymentStatus } from '@/types';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';
import { HttpError } from '@/lib/http';
import { useStudent, useStudentClassHistory } from '@/hooks/use-students';
import { useCreateSessionPayment, usePaymentsByStudent } from '@/hooks/use-payments';
import { useAttendanceByStudent } from '@/hooks/use-attendance';
import { useQueryClient } from '@tanstack/react-query';
import {
  invalidatePaymentsByStudent,
  invalidateStudent,
  invalidateStudentClassHistory,
  invalidateStudentsByClass,
} from '@/lib/queryHelpers';

// Convert API ClassHistoryResponse to ClassHistoryItem
const convertToClassHistoryItem = (apiHistory: ClassHistoryResponse): ClassHistoryItem => {
  // Map backend status to frontend status
  const statusMap: Record<string, 'studying' | 'completed' | 'transferred' | 'changing' | 'dropped'> = {
    'STUDYING': 'studying',
    'COMPLETED': 'completed',
    'CHANGING': 'transferred',
    'DROPPED': 'dropped',
  };

  return {
    id: apiHistory.id,
    className: apiHistory.className,
    classId: apiHistory.classId,
    joinedAt: apiHistory.joinedAt,
    leftAt: apiHistory.leftAt,
    status: statusMap[apiHistory.status] || 'studying',
    reason: apiHistory.reason,
  };
};


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

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;
  const locale = params.locale as string;
  const t = useTranslations('student-detail');
  const tNotif = useTranslations('notifications');

  const queryClient = useQueryClient();

  const {
    data: studentData,
    isLoading: isLoadingStudent,
    error: studentError,
  } = useStudent(studentId);

  const {
    data: classHistoryApi = [],
    isLoading: isLoadingClassHistory,
  } = useStudentClassHistory(studentId);

  const {
    data: paymentsApi = [],
    isLoading: isLoadingPayments,
  } = usePaymentsByStudent(studentId);

  const createSessionPayment = useCreateSessionPayment();

  // Fetch attendance data
  const {
    data: attendances = [],
    isLoading: isLoadingAttendance,
  } = useAttendanceByStudent(studentId, studentData?.class?.id);

  useEffect(() => {
    if (studentError instanceof HttpError && studentError.status === 404) {
      router.push(`/${locale}/__not-found__`);
    }
  }, [studentError, router, locale]);

  useEffect(() => {
    if (studentError && !(studentError instanceof HttpError && studentError.status === 404)) {
      toast.error(tNotif('errorLoadStudentInfo'));
    }
  }, [studentError, tNotif]);

  const refreshStudentData = useCallback(() => {
    if (!studentId) return;
    invalidateStudent(queryClient, studentId);
    invalidateStudentClassHistory(queryClient, studentId);
    invalidatePaymentsByStudent(queryClient, studentId);
  }, [queryClient, studentId]);

  const monthNames = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthKey = `month${i + 1}` as const;
      return t(monthKey) || `Month ${i + 1}`;
    });
  }, [t]);

  const paymentHistory = useMemo(() => {
    return paymentsApi
      .map((payment) => convertToPaymentHistoryItem(payment, monthNames))
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [paymentsApi, monthNames]);

  const classHistory = useMemo(() => {
    return classHistoryApi.map(convertToClassHistoryItem);
  }, [classHistoryApi]);

  // Handle session payment submit (new - session-based)
  const handleSessionPaymentSubmit = async (data: {
    studentId: string;
    packageNumber: number;
    startSessionNumber: number;
    endSessionNumber: number;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => {
    try {
      if (!studentData?.class?.monthlyFee) {
        toast.error(tNotif('errorGetFeeInfo'));
        return;
      }

      await createSessionPayment.mutateAsync({
        data: data as CreateSessionPaymentData,
        monthlyFee: studentData.class.monthlyFee,
      });

      // Invalidate caches so all related views refresh
      invalidateStudent(queryClient, studentId);
      invalidatePaymentsByStudent(queryClient, studentId);
      if (studentData.class?.id) {
        invalidateStudentsByClass(queryClient, studentData.class.id);
      }

      toast.success(tNotif('paymentRecordedSuccessfully'));
    } catch (error) {
      console.error('Lỗi khi ghi nhận thanh toán', error);
      toast.error(tNotif('errorRecordPayment'));
      // Don't close dialog on error - let user retry
      throw error; // Re-throw to prevent dialog from closing
    }
  };

  // Convert session payment statuses from API
  const sessionPayments: SessionPaymentStatus[] = useMemo(() => {
    return studentData?.sessionPaymentStatuses || [];
  }, [studentData?.sessionPaymentStatuses]);

  // Get current package for progress indicator (ưu tiên package đang sử dụng, nếu không có thì lấy package chưa thanh toán đủ)
  const currentUnpaidPackage = sessionPayments.find((p) => p.isCurrent === true) 
    || sessionPayments.find((p) => p.status === 'UNPAID' || p.status === 'PARTIAL');

  const isLoading = isLoadingStudent || isLoadingClassHistory || isLoadingPayments || isLoadingAttendance;

  if (isLoading) {
    return <PageLoading />;
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">{t('noStudentInfo')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header with Breadcrumb */}
      <StudentDetailHeader studentName={studentData.fullName} />

      {/* Student Information Cards - Top Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StudentPersonalInfo student={studentData} />
        <StudentParentInfo student={studentData} />
        <StudentClassInfo
          student={studentData}
          onUpdate={refreshStudentData}
        />
      </div>

      <SessionPaymentList
        sessionPayments={sessionPayments}
        monthlyFee={studentData?.class?.monthlyFee || 0}
        studentId={studentData?.id}
        paymentHistory={paymentHistory}
        onPaymentSubmit={handleSessionPaymentSubmit}
        isSubmittingPayment={createSessionPayment.isPending}
      />

      <StudentPaymentHistory paymentHistory={paymentHistory} />

      <StudentAttendanceSessions
        attendances={attendances}
        currentPackageNumber={currentUnpaidPackage?.packageNumber}
        currentPackageStartSession={currentUnpaidPackage?.startSessionNumber}
        currentPackageEndSession={currentUnpaidPackage?.endSessionNumber}
        studentName={studentData.fullName}
        sessionPayments={sessionPayments}
      />

      <StudentClassHistory classHistory={classHistory} />
    </div>
  );
}
