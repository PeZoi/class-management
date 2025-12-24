'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  ClassroomDetailHeader,
  ClassroomDetailRevenueChart,
  ClassroomScheduleInfo,
  ClassroomStatsCards,
  ClassroomStudentsList,
  ClassroomTeacherInfo,
  ClassroomUnpaidStudentsList,
} from './_components';

type TimePeriod = '3months' | '6months' | '12months';

interface Student {
  id: number;
  studentName: string;
  parentName: string;
  studentPhoneNumber: string;
  parentPhoneNumber: string;
  email: string;
  dob: string; // Date of Birth
  gender: 'male' | 'female' | 'other';
  classJoinedAt: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  amountPaid: number;
  totalFee: number;
}

// Mock data - trong thực tế sẽ fetch từ API dựa vào id
const classDetails = {
  1: {
    id: 1,
    name: 'JavaScript Nâng Cao',
    teacher: 'Nguyễn Văn A',
    teacherEmail: 'nguyenvana@example.com',
    teacherPhone: '0912345678',
    students: 35,
    revenue: 87500000,
    schedule: 'Thứ 2, Thứ 4, Thứ 6',
    time: '19:00 - 21:00',
    duration: '3 tháng',
    tuitionFee: 2500000,
    collected: 87500000,
    total: 87500000,
    level: 'Intermediate',
    description: 'Khóa học JavaScript nâng cao dành cho những người đã có kiến thức cơ bản về JavaScript',
    color: '#3b82f6',
  },
  2: {
    id: 2,
    name: 'React & Next.js',
    teacher: 'Trần Thị B',
    teacherEmail: 'tranthib@example.com',
    teacherPhone: '0987654321',
    students: 42,
    revenue: 126000000,
    schedule: 'Thứ 3, Thứ 5, Thứ 7',
    time: '18:30 - 20:30',
    duration: '4 tháng',
    tuitionFee: 3000000,
    collected: 108000000,
    total: 126000000,
    level: 'Advanced',
    description: 'Học React và Next.js từ cơ bản đến nâng cao',
    color: '#8b5cf6',
  },
  // Add more classes as needed
};

const revenueDataByClass: Record<
  number,
  Record<TimePeriod, Array<{ month: string; revenue: number; label: string }>>
> = {
  1: {
    '3months': [
      { month: 'T10', revenue: 87500000, label: 'Tháng 10' },
      { month: 'T11', revenue: 87500000, label: 'Tháng 11' },
      { month: 'T12', revenue: 87500000, label: 'Tháng 12' },
    ],
    '6months': [
      { month: 'T7', revenue: 85000000, label: 'Tháng 7' },
      { month: 'T8', revenue: 86000000, label: 'Tháng 8' },
      { month: 'T9', revenue: 87000000, label: 'Tháng 9' },
      { month: 'T10', revenue: 87500000, label: 'Tháng 10' },
      { month: 'T11', revenue: 87500000, label: 'Tháng 11' },
      { month: 'T12', revenue: 87500000, label: 'Tháng 12' },
    ],
    '12months': [
      { month: 'T1', revenue: 80000000, label: 'Tháng 1' },
      { month: 'T2', revenue: 81000000, label: 'Tháng 2' },
      { month: 'T3', revenue: 82000000, label: 'Tháng 3' },
      { month: 'T4', revenue: 83000000, label: 'Tháng 4' },
      { month: 'T5', revenue: 84000000, label: 'Tháng 5' },
      { month: 'T6', revenue: 85000000, label: 'Tháng 6' },
      { month: 'T7', revenue: 85000000, label: 'Tháng 7' },
      { month: 'T8', revenue: 86000000, label: 'Tháng 8' },
      { month: 'T9', revenue: 87000000, label: 'Tháng 9' },
      { month: 'T10', revenue: 87500000, label: 'Tháng 10' },
      { month: 'T11', revenue: 87500000, label: 'Tháng 11' },
      { month: 'T12', revenue: 87500000, label: 'Tháng 12' },
    ],
  },
  2: {
    '3months': [
      { month: 'T10', revenue: 126000000, label: 'Tháng 10' },
      { month: 'T11', revenue: 120000000, label: 'Tháng 11' },
      { month: 'T12', revenue: 126000000, label: 'Tháng 12' },
    ],
    '6months': [
      { month: 'T7', revenue: 120000000, label: 'Tháng 7' },
      { month: 'T8', revenue: 123000000, label: 'Tháng 8' },
      { month: 'T9', revenue: 125000000, label: 'Tháng 9' },
      { month: 'T10', revenue: 126000000, label: 'Tháng 10' },
      { month: 'T11', revenue: 120000000, label: 'Tháng 11' },
      { month: 'T12', revenue: 126000000, label: 'Tháng 12' },
    ],
    '12months': [
      { month: 'T1', revenue: 115000000, label: 'Tháng 1' },
      { month: 'T2', revenue: 116000000, label: 'Tháng 2' },
      { month: 'T3', revenue: 117000000, label: 'Tháng 3' },
      { month: 'T4', revenue: 118000000, label: 'Tháng 4' },
      { month: 'T5', revenue: 119000000, label: 'Tháng 5' },
      { month: 'T6', revenue: 120000000, label: 'Tháng 6' },
      { month: 'T7', revenue: 120000000, label: 'Tháng 7' },
      { month: 'T8', revenue: 123000000, label: 'Tháng 8' },
      { month: 'T9', revenue: 125000000, label: 'Tháng 9' },
      { month: 'T10', revenue: 126000000, label: 'Tháng 10' },
      { month: 'T11', revenue: 120000000, label: 'Tháng 11' },
      { month: 'T12', revenue: 126000000, label: 'Tháng 12' },
    ],
  },
};

// Mock students data
const studentsData: Record<number, Student[]> = {
  1: [
    {
      id: 1,
      studentName: 'Nguyễn Văn A',
      parentName: 'Nguyễn Văn Phụ Huynh A',
      studentPhoneNumber: '0901234567',
      parentPhoneNumber: '0981234567',
      email: 'nguyenvana@example.com',
      dob: '2010-05-15',
      gender: 'male',
      classJoinedAt: '2024-01-10',
      paymentStatus: 'paid',
      amountPaid: 2500000,
      totalFee: 2500000,
    },
    {
      id: 2,
      studentName: 'Trần Thị B',
      parentName: 'Trần Văn Phụ Huynh B',
      studentPhoneNumber: '0902234567',
      parentPhoneNumber: '0982234567',
      email: 'tranthib@example.com',
      dob: '2011-03-20',
      gender: 'female',
      classJoinedAt: '2024-01-15',
      paymentStatus: 'paid',
      amountPaid: 2500000,
      totalFee: 2500000,
    },
    {
      id: 3,
      studentName: 'Lê Văn C',
      parentName: 'Lê Thị Phụ Huynh C',
      studentPhoneNumber: '0903234567',
      parentPhoneNumber: '0983234567',
      email: 'levanc@example.com',
      dob: '2010-08-12',
      gender: 'male',
      classJoinedAt: '2024-02-01',
      paymentStatus: 'partial',
      amountPaid: 1500000,
      totalFee: 2500000,
    },
    {
      id: 4,
      studentName: 'Phạm Thị D',
      parentName: 'Phạm Văn Phụ Huynh D',
      studentPhoneNumber: '0904234567',
      parentPhoneNumber: '0984234567',
      email: 'phamthid@example.com',
      dob: '2011-11-25',
      gender: 'female',
      classJoinedAt: '2024-02-15',
      paymentStatus: 'unpaid',
      amountPaid: 0,
      totalFee: 2500000,
    },
    {
      id: 5,
      studentName: 'Võ Minh E',
      parentName: 'Võ Văn Phụ Huynh E',
      studentPhoneNumber: '0905234567',
      parentPhoneNumber: '0985234567',
      email: 'vominhe@example.com',
      dob: '2010-07-08',
      gender: 'male',
      classJoinedAt: '2024-03-01',
      paymentStatus: 'paid',
      amountPaid: 2500000,
      totalFee: 2500000,
    },
    {
      id: 6,
      studentName: 'Đặng Thị F',
      parentName: 'Đặng Văn Phụ Huynh F',
      studentPhoneNumber: '0906234567',
      parentPhoneNumber: '0986234567',
      email: 'dangthif@example.com',
      dob: '2011-02-14',
      gender: 'female',
      classJoinedAt: '2024-03-15',
      paymentStatus: 'partial',
      amountPaid: 2000000,
      totalFee: 2500000,
    },
  ],
  2: [
    {
      id: 1,
      studentName: 'Hoàng Văn G',
      parentName: 'Hoàng Thị Phụ Huynh G',
      studentPhoneNumber: '0907234567',
      parentPhoneNumber: '0987234567',
      email: 'hoangvang@example.com',
      dob: '2009-04-22',
      gender: 'male',
      classJoinedAt: '2024-01-05',
      paymentStatus: 'paid',
      amountPaid: 3000000,
      totalFee: 3000000,
    },
    {
      id: 2,
      studentName: 'Bùi Thị H',
      parentName: 'Bùi Văn Phụ Huynh H',
      studentPhoneNumber: '0908234567',
      parentPhoneNumber: '0988234567',
      email: 'buithih@example.com',
      dob: '2009-09-18',
      gender: 'female',
      classJoinedAt: '2024-01-20',
      paymentStatus: 'paid',
      amountPaid: 3000000,
      totalFee: 3000000,
    },
  ],
};

export default function ClassroomDetailPage() {
  const params = useParams();
  const classId = Number(params.id);

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');

  // Get class data (in real app, this would be fetched from API)
  const classData = classDetails[classId as keyof typeof classDetails] || classDetails[1];
  const students = studentsData[classId] || studentsData[1];
  const revenueData = revenueDataByClass[classId]?.[selectedPeriod] || revenueDataByClass[1][selectedPeriod];

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header with Breadcrumb */}
      <ClassroomDetailHeader classData={classData} />

      {/* Stats Cards */}
      <ClassroomStatsCards
        students={classData.students}
        revenue={classData.revenue}
        tuitionFee={classData.tuitionFee}
        collected={classData.collected}
        total={classData.total}
      />

      {/* Class Info & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassroomTeacherInfo
          teacher={classData.teacher}
          teacherEmail={classData.teacherEmail}
          teacherPhone={classData.teacherPhone}
        />
        <ClassroomScheduleInfo schedule={classData.schedule} time={classData.time} duration={classData.duration} />
      </div>

      {/* Revenue Chart */}
      <ClassroomDetailRevenueChart
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        revenueData={revenueData}
        color={classData.color}
      />

      {/* Students List */}
      <ClassroomStudentsList students={students} />

      {/* Unpaid Students List */}
      <ClassroomUnpaidStudentsList students={students} />
    </div>
  );
}
