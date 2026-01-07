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
import { studentService } from '@/services';
import { StudentType, MonthPaymentStatus } from '@/types';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import { useMemo } from 'react';

// Mock data for class history
const generateMockClassHistory = (): ClassHistoryItem[] => {
  return [
    {
      id: '1',
      className: 'JavaScript Cơ Bản',
      classId: '1',
      joinedAt: '2024-01-15T00:00:00Z',
      leftAt: '2024-06-30T00:00:00Z',
      status: 'completed',
      reason: 'Hoàn thành khóa học',
    },
    {
      id: '2',
      className: 'JavaScript Nâng Cao',
      classId: '2',
      joinedAt: '2024-07-01T00:00:00Z',
      leftAt: '2024-09-15T00:00:00Z',
      status: 'transferred',
      reason: 'Chuyển lớp theo yêu cầu',
    },
    {
      id: '3',
      className: 'React & Next.js',
      classId: '3',
      joinedAt: '2024-09-16T00:00:00Z',
      status: 'studying',
    },
  ];
};

// Mock data for payment history
const generateMockPaymentHistory = (): PaymentHistoryItem[] => {
  return [
    {
      id: '1',
      invoiceId: 'INV-2024-001',
      paymentDate: '2024-01-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'bank_transfer',
      status: 'paid',
      period: 'Tháng 1/2024',
      notes: 'Thanh toán đầy đủ',
    },
    {
      id: '2',
      invoiceId: 'INV-2024-002',
      paymentDate: '2024-02-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'cash',
      status: 'paid',
      period: 'Tháng 2/2024',
    },
    {
      id: '3',
      invoiceId: 'INV-2024-003',
      paymentDate: '2024-03-20T00:00:00Z',
      amount: 1500000,
      paymentMethod: 'bank_transfer',
      status: 'paid',
      period: 'Tháng 3/2024',
      notes: 'Thanh toán một phần',
    },
    {
      id: '4',
      invoiceId: 'INV-2024-004',
      paymentDate: '2024-04-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'e_wallet',
      status: 'paid',
      period: 'Tháng 4/2024',
    },
    {
      id: '5',
      invoiceId: 'INV-2024-005',
      paymentDate: '2024-05-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'bank_transfer',
      status: 'paid',
      period: 'Tháng 5/2024',
    },
    {
      id: '6',
      invoiceId: 'INV-2024-006',
      paymentDate: '2024-06-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'cash',
      status: 'paid',
      period: 'Tháng 6/2024',
    },
    {
      id: '7',
      invoiceId: 'INV-2024-007',
      paymentDate: '2024-07-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'bank_transfer',
      status: 'paid',
      period: 'Tháng 7/2024',
    },
    {
      id: '8',
      invoiceId: 'INV-2024-008',
      paymentDate: '2024-08-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'credit_card',
      status: 'paid',
      period: 'Tháng 8/2024',
    },
    {
      id: '9',
      invoiceId: 'INV-2024-009',
      paymentDate: '2024-09-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'bank_transfer',
      status: 'paid',
      period: 'Tháng 9/2024',
    },
    {
      id: '10',
      invoiceId: 'INV-2024-010',
      paymentDate: '2024-10-15T00:00:00Z',
      amount: 2500000,
      paymentMethod: 'e_wallet',
      status: 'paid',
      period: 'Tháng 10/2024',
    },
  ];
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

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id;

  const [studentData, setStudentData] = useState<StudentType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock data states (for features not yet implemented)
  const [classHistory] = useState<ClassHistoryItem[]>(() => generateMockClassHistory());
  const [paymentHistory] = useState<PaymentHistoryItem[]>(() => generateMockPaymentHistory());
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
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
      />

      <StudentPaymentHistory paymentHistory={paymentHistory} />

      <StudentAttendance attendanceSessions={attendanceSessions} studentName={studentData.fullName} />

      {/* Class History - Full Width */}
      <StudentClassHistory classHistory={classHistory} />
    </div>
  );
}