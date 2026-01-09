'use client';

import { TeacherType } from '@/types/teacher-type';
import {
  TeacherAttendance,
  TeacherClassesList,
  TeacherDetailHeader,
  TeacherSalaryHistory,
} from './_components';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { teacherService } from '@/services/teacher-service';
import { classService } from '@/services/class-service';
import { ClassType } from '@/types';
import { PageLoading } from '@/components/page-loading';

// Mock salary history data
const mockSalaryHistory = [
  {
    id: '1',
    paymentDate: '2024-01-15T00:00:00Z',
    period: 'Tháng 12/2023',
    baseSalary: 15000000,
    bonus: 2000000,
    deduction: 0,
    totalAmount: 17000000,
    paymentMethod: 'bank_transfer' as const,
    status: 'paid' as const,
    notes: 'Thanh toán đầy đủ',
  },
  {
    id: '2',
    paymentDate: '2023-12-15T00:00:00Z',
    period: 'Tháng 11/2023',
    baseSalary: 15000000,
    bonus: 1500000,
    deduction: 500000,
    totalAmount: 16000000,
    paymentMethod: 'bank_transfer' as const,
    status: 'paid' as const,
    notes: 'Khấu trừ bảo hiểm',
  },
  {
    id: '3',
    paymentDate: '2023-11-15T00:00:00Z',
    period: 'Tháng 10/2023',
    baseSalary: 15000000,
    bonus: 3000000,
    deduction: 0,
    totalAmount: 18000000,
    paymentMethod: 'cash' as const,
    status: 'paid' as const,
  },
  {
    id: '4',
    paymentDate: '2023-10-15T00:00:00Z',
    period: 'Tháng 9/2023',
    baseSalary: 15000000,
    bonus: 1000000,
    deduction: 0,
    totalAmount: 16000000,
    paymentMethod: 'bank_transfer' as const,
    status: 'paid' as const,
  },
];

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

export default function TeacherDetailPage() {
  const params = useParams();
  const teacherId = params.id;

  const [teacherData, setTeacherData] = useState<TeacherType>();
  const [classesData, setClassesData] = useState<ClassType[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teacherResponse, classesResponse] = await Promise.all([
          teacherService.getTeacherById(teacherId as string),
          classService.getClassesByTeacherId(teacherId as string),
        ]);

        if (teacherResponse.status === 200 && teacherResponse.data) {
          setTeacherData(teacherResponse.data);
        }

        if (classesResponse.status === 200 && classesResponse.data) {
          setClassesData(classesResponse.data);
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
  }, [teacherId])

  if (loading || !teacherData || !classesData) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <TeacherDetailHeader teacherData={teacherData} />

      {/* Classes List - Full Width */}
      <TeacherClassesList classes={classesData} />

      {/* Salary History */}
      <TeacherSalaryHistory salaryHistory={mockSalaryHistory} />

      {/* Attendance */}
      <TeacherAttendance attendanceRecords={mockAttendanceRecords} />
    </div>
  );
}
