'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  StudentDetailHeader,
  StudentPersonalInfo,
  StudentParentInfo,
  StudentClassInfo,
  StudentClassHistory,
  StudentPaymentHistory,
  StudentAttendance,
  PaymentStatusCalendar,
  ClassHistoryItem,
  PaymentHistoryItem,
  AttendanceSession,
  PaymentMonthStatus,
} from './_components';
import { studentService, paymentService } from '@/services';
import { StudentType, MonthPaymentStatus, CreateStudentPaymentData, PaymentResponse, ClassHistoryResponse } from '@/types';
import { toast } from 'react-toastify';
import { useMemo } from 'react';
import { formatCurrency } from '@/utils/helper';
import { PageLoading } from '@/components/page-loading';

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

// Mock data for attendance
const generateMockAttendance = (): AttendanceSession[] => {
  const sessions: AttendanceSession[] = [];
  const currentDate = new Date();

  // Generate sessions for the last 3 months
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;

    // Generate 8 sessions per month (2 per week)
    for (let week = 0; week < 4; week++) {
      // Monday session
      const mondayDate = new Date(year, monthNum - 1, 1 + week * 7);
      if (mondayDate.getMonth() === monthNum - 1) {
        const random = Math.random();
        sessions.push({
          id: `session-${sessions.length + 1}`,
          date: mondayDate.toISOString().split('T')[0],
          sessionNumber: sessions.length + 1,
          status: random > 0.2 ? 'present' : random > 0.15 ? 'late' : 'absent',
          checkInTime: random > 0.2 ? '19:00' : random > 0.15 ? '19:15' : undefined,
        });
      }

      // Thursday session
      const thursdayDate = new Date(year, monthNum - 1, 4 + week * 7);
      if (thursdayDate.getMonth() === monthNum - 1) {
        const random = Math.random();
        sessions.push({
          id: `session-${sessions.length + 1}`,
          date: thursdayDate.toISOString().split('T')[0],
          sessionNumber: sessions.length + 1,
          status: random > 0.2 ? 'present' : random > 0.15 ? 'late' : 'absent',
          checkInTime: random > 0.2 ? '19:00' : random > 0.15 ? '19:10' : undefined,
        });
      }
    }
  }

  return sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

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

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id;

  const [studentData, setStudentData] = useState<StudentType | null>(null);
  const [loading, setLoading] = useState(true);

  // Class history state
  const [classHistory, setClassHistory] = useState<ClassHistoryItem[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [attendanceSessions] = useState<AttendanceSession[]>(() => generateMockAttendance());

  // Convert API monthPaymentStatuses to component format
  const monthlyPayments = useMemo(() => {
    if (studentData?.monthPaymentStatuses && studentData.monthPaymentStatuses.length > 0) {
      return convertToPaymentMonthStatus(studentData.monthPaymentStatuses);
    }
    // Fallback to empty array if no data
    return [];
  }, [studentData?.monthPaymentStatuses]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return;

      setLoading(true);
      try {
        const response = await studentService.getStudentById(studentId as string);
        if (response.status === 200 && response.data) {
          setStudentData(response.data);
        } else {
          toast.error('Không thể tải thông tin học viên.');
        }
      } catch (error) {
        console.error('Lỗi fetch thông tin học viên', error);
        toast.error('Không thể tải thông tin học viên.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  // Fetch payment history
  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!studentId) return;

      try {
        const response = await paymentService.getPaymentsByStudentId(studentId as string);
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
  }, [studentId]);

  // Fetch class history
  useEffect(() => {
    const fetchClassHistory = async () => {
      if (!studentId) return;

      try {
        const response = await studentService.getClassHistory(studentId as string);
        if (response.status === 200 && response.data) {
          const convertedHistory = response.data.map(convertToClassHistoryItem);
          setClassHistory(convertedHistory);
        }
      } catch (error) {
        console.error('Lỗi fetch lịch sử lớp học', error);
        // Don't show error toast, just log it
      }
    };

    fetchClassHistory();
  }, [studentId]);

  // Handle payment submit from calendar
  const handlePaymentSubmit = async (data: CreateStudentPaymentData) => {
    try {
      if (!studentData?.class?.monthlyFee) {
        toast.error('Không thể lấy thông tin học phí.');
        return;
      }

      // Call API to create payment
      const response = await paymentService.createStudentPayment(data, studentData.class.monthlyFee);

      if (response.status === 201 && response.data) {
        toast.success(`Đã ghi nhận thanh toán ${formatCurrency(data.amount)} cho tháng ${data.month}/${data.year}`);

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
      } else {
        toast.error('Không thể ghi nhận thanh toán.');
      }
    } catch (error) {
      console.error('Lỗi khi ghi nhận thanh toán', error);
      toast.error('Không thể ghi nhận thanh toán.');
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-slate-600 dark:text-slate-400">Không tìm thấy thông tin học viên</p>
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
        <StudentClassInfo student={studentData} />
      </div>

      {/* Payment Status Calendar - Quick Overview */}
      <PaymentStatusCalendar
        monthlyPayments={monthlyPayments}
        monthlyFee={studentData?.class?.monthlyFee || 0}
        studentId={studentData?.id}
        paymentHistory={paymentHistory}
        onPaymentSubmit={handlePaymentSubmit}
      />

      <StudentPaymentHistory paymentHistory={paymentHistory} />

      <StudentAttendance attendanceSessions={attendanceSessions} studentName={studentData.fullName} />

      {/* Class History - Full Width */}
      <StudentClassHistory classHistory={classHistory} />
    </div>
  );
}
