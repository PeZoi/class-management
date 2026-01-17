'use client';

import { useTranslations } from 'next-intl';
import { TeacherType } from '@/types/teacher-type';
import {
  TeacherAttendance,
  TeacherClassesList,
  TeacherDetailHeader,
  TeacherSalaryHistory,
  TeacherSalaryPaymentCalendar,
} from './_components';
import { SalaryMonthStatus, SalaryPayment } from '@/types';
import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { teacherService } from '@/services/teacher-service';
import { classService } from '@/services/class-service';
import { paymentService } from '@/services/payment-service';
import { ClassType, PaymentResponse, CreateTeacherPaymentData } from '@/types';
import { PageLoading } from '@/components/page-loading';
import { toast } from 'react-toastify';

// Convert PaymentResponse to SalaryPayment
const convertToSalaryPayment = (payment: PaymentResponse): SalaryPayment => {
  const billingDate = new Date(payment.billingMonth);
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
    id: payment.id || payment.paymentId,
    invoiceId: payment.paymentId || `PAY-${payment.id}`,
    paymentDate: payment.createdAt || new Date().toISOString(),
    period,
    baseSalary: payment.feeSnapshot || 0,
    bonus: payment.bonus || 0,
    deduction: payment.deduction || 0,
    totalAmount: (payment.feeSnapshot || 0) + (payment.bonus || 0) - (payment.deduction || 0),
    paymentMethod: paymentMethodMap[payment.paymentMethod] || 'bank_transfer',
    status: statusMap[payment.paymentStatus] || 'partial',
    notes: payment.note,
  };
};

// Mock attendance data
const mockAttendanceRecords = [
  {
    id: '1',
    date: '2024-01-15T00:00:00Z',
    className: 'JavaScript Nâng Cao',
    checkInTime: '2024-01-15T18:30:00Z',
    checkOutTime: '2024-01-15T21:00:00Z',
    status: 'present' as const,
  },
  {
    id: '2',
    date: '2024-01-13T00:00:00Z',
    className: 'React & Next.js',
    checkInTime: '2024-01-13T19:00:00Z',
    checkOutTime: '2024-01-13T21:00:00Z',
    status: 'present' as const,
  },
  {
    id: '3',
    date: '2024-01-11T00:00:00Z',
    className: 'JavaScript Nâng Cao',
    checkInTime: '2024-01-11T18:45:00Z',
    checkOutTime: '2024-01-11T21:00:00Z',
    status: 'late' as const,
    notes: 'Đi muộn 15 phút',
  },
  {
    id: '4',
    date: '2024-01-09T00:00:00Z',
    className: 'Python for Data Science',
    checkInTime: '2024-01-09T08:00:00Z',
    checkOutTime: '2024-01-09T10:30:00Z',
    status: 'present' as const,
  },
  {
    id: '5',
    date: '2024-01-08T00:00:00Z',
    className: 'React & Next.js',
    checkInTime: undefined,
    checkOutTime: undefined,
    status: 'absent' as const,
    notes: 'Nghỉ phép',
  },
  {
    id: '6',
    date: '2024-01-06T00:00:00Z',
    className: 'JavaScript Nâng Cao',
    checkInTime: '2024-01-06T18:30:00Z',
    checkOutTime: '2024-01-06T20:30:00Z',
    status: 'early_leave' as const,
    notes: 'Về sớm 30 phút',
  },
];

// Generate all months from startDate to current date
const generateAllMonths = (startDate: Date, endDate: Date = new Date()): Array<{ month: number; year: number }> => {
  const months: Array<{ month: number; year: number }> = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1); // Start from first day of month
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  while (current <= end) {
    months.push({
      month: current.getMonth() + 1,
      year: current.getFullYear(),
    });
    // Move to next month
    current.setMonth(current.getMonth() + 1);
  }

  return months;
};

// Convert PaymentResponse from API to SalaryMonthStatus for calendar
const convertToSalaryMonthStatus = (
  payments: PaymentResponse[],
  teacherCreatedAt?: string
): SalaryMonthStatus[] => {
  // Group payments by month/year
  const paymentsByMonth = new Map<string, PaymentResponse[]>();

  payments.forEach((payment) => {
    if (!payment.billingMonth) return;
    const billingDate = new Date(payment.billingMonth);
    const month = billingDate.getMonth() + 1;
    const year = billingDate.getFullYear();
    const key = `${year}-${month}`;

    if (!paymentsByMonth.has(key)) {
      paymentsByMonth.set(key, []);
    }
    paymentsByMonth.get(key)!.push(payment);
  });

  // Generate all months from teacher createdAt to now
  const allMonths: Array<{ month: number; year: number }> = [];
  if (teacherCreatedAt) {
    const startDate = new Date(teacherCreatedAt);
    allMonths.push(...generateAllMonths(startDate));
  }

  // Convert to SalaryMonthStatus array
  const salaryStatusesMap = new Map<string, SalaryMonthStatus>();

  // First, add all months from createdAt to now with unpaid status
  allMonths.forEach(({ month, year }) => {
    const key = `${year}-${month}`;
    if (!salaryStatusesMap.has(key)) {
      salaryStatusesMap.set(key, {
        month,
        year,
        status: 'unpaid',
        baseSalary: 0,
        bonus: 0,
        deduction: 0,
        totalAmount: 0,
        paidAmount: 0,
      });
    }
  });

  // Then, update with actual payment data
  paymentsByMonth.forEach((monthPayments, key) => {
    const [year, month] = key.split('-').map(Number);
    
    // Sort payments by createdAt to get the most recent one for baseSalary, bonus, deduction
    const sortedPayments = [...monthPayments].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA; // Most recent first
    });

    // Get baseSalary, bonus, deduction from the most recent payment
    // These should represent the current expected salary for the month
    const mostRecentPayment = sortedPayments[0];
    const baseSalary = mostRecentPayment.feeSnapshot || 0;
    const bonus = mostRecentPayment.bonus || 0;
    const deduction = mostRecentPayment.deduction || 0;
    
    // Total amount = baseSalary + bonus - deduction (should be the same for all payments in the month)
    const totalAmount = baseSalary + bonus - deduction;

    // Sum all paid amounts from all payments in this month
    const paidAmount = monthPayments.reduce((sum, p) => sum + (p.paid || 0), 0);

    // Determine status
    let status: 'paid' | 'unpaid' | 'partial';
    if (totalAmount <= 0) {
      status = 'unpaid';
    } else if (paidAmount >= totalAmount) {
      status = 'paid';
    } else if (paidAmount > 0) {
      status = 'partial';
    } else {
      status = 'unpaid';
    }

    salaryStatusesMap.set(key, {
      month,
      year,
      status,
      baseSalary,
      bonus,
      deduction,
      totalAmount,
      paidAmount,
    });
  });

  return Array.from(salaryStatusesMap.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
};

export default function TeacherDetailPage() {
  const tNotif = useTranslations('notifications');
  const params = useParams();
  const teacherId = params.id;

  const [teacherData, setTeacherData] = useState<TeacherType>();
  const [classesData, setClassesData] = useState<ClassType[]>();
  const [paymentHistory, setPaymentHistory] = useState<PaymentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Convert payment history to salary month statuses
  const monthlySalaries = useMemo(() => {
    return convertToSalaryMonthStatus(paymentHistory, teacherData?.createdAt);
  }, [paymentHistory, teacherData?.createdAt]);

  // Convert payment history to SalaryPayment format for history table
  const salaryHistoryData = useMemo(() => {
    return paymentHistory.map(convertToSalaryPayment);
  }, [paymentHistory]);

  // Get base salary (default to 0 if not available)
  const baseSalary = useMemo(() => {
    // Try to get from the most recent payment, or use a default
    if (paymentHistory.length > 0) {
      const recentPayment = paymentHistory[0];
      return recentPayment.feeSnapshot || 0;
    }
    return 0; // Default base salary, can be updated later
  }, [paymentHistory]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teacherResponse, classesResponse, paymentsResponse] = await Promise.all([
          teacherService.getTeacherById(teacherId as string),
          classService.getClassesByTeacherId(teacherId as string),
          paymentService.getPaymentsByTeacherId(teacherId as string),
        ]);

        if (teacherResponse.status === 200 && teacherResponse.data) {
          setTeacherData(teacherResponse.data);
        }

        if (classesResponse.status === 200 && classesResponse.data) {
          setClassesData(classesResponse.data);
        }

        if (paymentsResponse.status === 200 && paymentsResponse.data) {
          // Filter only TEACHER_SALARY payments and sort by createdAt desc
          const teacherPayments = paymentsResponse.data
            .filter((p: PaymentResponse) => p.paymentType === 'TEACHER_SALARY')
            .sort((a: PaymentResponse, b: PaymentResponse) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setPaymentHistory(teacherPayments);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchData();
    }
  }, [teacherId]);

  // Handle salary payment submit
  const handleSalaryPaymentSubmit = async (data: {
    teacherId: string;
    month: number;
    year: number;
    baseSalary: number;
    bonus: number;
    deduction: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => {
    try {
      const paymentData: CreateTeacherPaymentData = {
        teacherId: data.teacherId,
        month: data.month,
        year: data.year,
        baseSalary: data.baseSalary,
        bonus: data.bonus,
        deduction: data.deduction,
        totalAmount: data.totalAmount,
        paymentMethod: data.paymentMethod,
        paymentDate: data.paymentDate,
        notes: data.notes,
      };

      const response = await paymentService.createTeacherPayment(paymentData);

      if (response.status === 201 && response.data) {
        toast.success(tNotif('successPaySalary'));
        
        // Tự động tải hóa đơn PDF
        if (response.data.paymentId || response.data.id) {
          try {
            const paymentId = response.data.paymentId || response.data.id;
            await paymentService.downloadInvoiceAndSave(paymentId, `HoaDonLuong_${paymentId}.pdf`);
          } catch (error) {
            console.error('Lỗi khi tải hóa đơn:', error);
            // Không hiển thị lỗi để không làm gián đoạn flow
          }
        }
        
        // Refresh payment history
        const paymentsResponse = await paymentService.getPaymentsByTeacherId(teacherId as string);
        if (paymentsResponse.status === 200 && paymentsResponse.data) {
          const teacherPayments = paymentsResponse.data
            .filter((p: PaymentResponse) => p.paymentType === 'TEACHER_SALARY')
            .sort((a: PaymentResponse, b: PaymentResponse) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });
          setPaymentHistory(teacherPayments);
        }
      } else {
        toast.error(tNotif('errorPaySalary'));
      }
    } catch (error) {
      console.error('Error creating salary payment:', error);
      toast.error(tNotif('errorPaySalary'));
    }
  };

  if (loading || !teacherData || !classesData) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <TeacherDetailHeader teacherData={teacherData} />

      {/* Classes List - Full Width */}
      <TeacherClassesList classes={classesData} />

      {/* Salary Payment Calendar */}
      <TeacherSalaryPaymentCalendar
        monthlySalaries={monthlySalaries}
        baseSalary={baseSalary}
        teacherId={teacherId as string}
        paymentHistory={paymentHistory}
        onPaymentSubmit={handleSalaryPaymentSubmit}
      />

      {/* Salary History */}
      <TeacherSalaryHistory salaryHistory={salaryHistoryData} />

      {/* Attendance */}
      <TeacherAttendance attendanceRecords={mockAttendanceRecords} />
    </div>
  );
}
