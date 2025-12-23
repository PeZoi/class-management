'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { OverduePaymentsAlert } from './_components/overdue-payments-alert';
import { RecentClassesTable } from './_components/recent-classes-table';
import { RevenueChart } from './_components/revenue-chart';
import { StatsCards } from './_components/stats-cards';
import { formatCurrency } from '@/utils/helper';

// Dữ liệu tĩnh cho dashboard
const statsData = {
  totalRevenue: 2847500000, // 2.847.500.000 VNĐ
  totalClasses: 45,
  totalStudents: 1250,
  activeClasses: 32,
  revenueGrowth: 15.2, // % tăng trưởng
  classGrowth: 8.5,
  studentGrowth: 12.3,
  activeGrowth: 5.1,
};

// Dữ liệu doanh thu theo thời gian
const revenueData = {
  '3months': [
    { month: 'T10', revenue: 620000000, label: 'Tháng 10' },
    { month: 'T11', revenue: 580000000, label: 'Tháng 11' },
    { month: 'T12', revenue: 680000000, label: 'Tháng 12' },
  ],
  '6months': [
    { month: 'T7', revenue: 420000000, label: 'Tháng 7' },
    { month: 'T8', revenue: 510000000, label: 'Tháng 8' },
    { month: 'T9', revenue: 445000000, label: 'Tháng 9' },
    { month: 'T10', revenue: 620000000, label: 'Tháng 10' },
    { month: 'T11', revenue: 580000000, label: 'Tháng 11' },
    { month: 'T12', revenue: 680000000, label: 'Tháng 12' },
  ],
  '12months': [
    { month: 'T1', revenue: 380000000, label: 'Tháng 1' },
    { month: 'T2', revenue: 450000000, label: 'Tháng 2' },
    { month: 'T3', revenue: 420000000, label: 'Tháng 3' },
    { month: 'T4', revenue: 490000000, label: 'Tháng 4' },
    { month: 'T5', revenue: 550000000, label: 'Tháng 5' },
    { month: 'T6', revenue: 480000000, label: 'Tháng 6' },
    { month: 'T7', revenue: 420000000, label: 'Tháng 7' },
    { month: 'T8', revenue: 510000000, label: 'Tháng 8' },
    { month: 'T9', revenue: 445000000, label: 'Tháng 9' },
    { month: 'T10', revenue: 620000000, label: 'Tháng 10' },
    { month: 'T11', revenue: 580000000, label: 'Tháng 11' },
    { month: 'T12', revenue: 680000000, label: 'Tháng 12' },
  ],
};

const recentClasses = [
  {
    id: 1,
    name: 'JavaScript Nâng Cao',
    teacher: 'Nguyễn Văn A',
    students: 35,
    revenue: 87500000,
    schedule: 'T2, T4, T6 - 19:00',
    duration: '3 tháng',
    tuitionFee: 2500000, // Học phí mỗi học viên
    collected: 87500000, // Đã thu
    total: 87500000, // Tổng cần thu (students * tuitionFee)
  },
  {
    id: 2,
    name: 'React & Next.js',
    teacher: 'Trần Thị B',
    students: 42,
    revenue: 126000000,
    schedule: 'T3, T5, T7 - 18:30',
    duration: '4 tháng',
    tuitionFee: 3000000,
    collected: 108000000,
    total: 126000000,
  },
  {
    id: 3,
    name: 'Python for Data Science',
    teacher: 'Lê Văn C',
    students: 28,
    revenue: 98000000,
    schedule: 'T2, T4 - 20:00',
    duration: '3 tháng',
    tuitionFee: 3500000,
    collected: 98000000,
    total: 98000000,
  },
  {
    id: 4,
    name: 'UI/UX Design Fundamentals',
    teacher: 'Phạm Thị D',
    students: 30,
    revenue: 75000000,
    schedule: 'T7, CN - 14:00',
    duration: '2 tháng',
    tuitionFee: 2500000,
    collected: 62500000,
    total: 75000000,
  },
  {
    id: 5,
    name: 'Machine Learning',
    teacher: 'Hoàng Văn E',
    students: 25,
    revenue: 112500000,
    schedule: 'T3, T5 - 19:30',
    duration: '5 tháng',
    tuitionFee: 4500000,
    collected: 90000000,
    total: 112500000,
  },
];

// Dữ liệu học viên nợ học phí
const overduePayments = [
  {
    id: 1,
    studentName: 'Nguyễn Văn Minh',
    studentPhone: '0912345678',
    studentEmail: 'minh.nguyen@email.com',
    studentGender: 'Male',
    studentBirthDate: '2005-03-15',
    startDate: '2024-09-01',
    className: 'JavaScript Nâng Cao',
    amountDue: 2500000,
    dueDate: '2024-11-15',
    daysOverdue: 37,
    contacted: false,
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0987654321',
  },
  {
    id: 2,
    studentName: 'Trần Thị Hương',
    studentPhone: '0923456789',
    studentEmail: 'huong.tran@email.com',
    studentGender: 'Female',
    studentBirthDate: '2004-07-20',
    startDate: '2024-08-15',
    className: 'React & Next.js',
    amountDue: 3000000,
    dueDate: '2024-11-20',
    daysOverdue: 32,
    contacted: true,
    parentName: 'Trần Văn Thành',
    parentPhone: '0976543210',
  },
  {
    id: 3,
    studentName: 'Lê Hoàng Nam',
    studentPhone: '0934567890',
    studentEmail: 'nam.le@email.com',
    studentGender: 'Male',
    studentBirthDate: '2005-11-10',
    startDate: '2024-10-01',
    className: 'UI/UX Design Fundamentals',
    amountDue: 2500000,
    dueDate: '2024-11-25',
    daysOverdue: 27,
    contacted: false,
    parentName: 'Lê Thị Lan',
    parentPhone: '0965432109',
  },
  {
    id: 4,
    studentName: 'Phạm Minh Tuấn',
    studentPhone: '0945678901',
    studentEmail: 'tuan.pham@email.com',
    studentGender: 'Male',
    studentBirthDate: '2003-05-22',
    startDate: '2024-07-10',
    className: 'Machine Learning',
    amountDue: 4500000,
    dueDate: '2024-12-01',
    daysOverdue: 21,
    contacted: true,
    parentName: 'Phạm Văn Cường',
    parentPhone: '0954321098',
  },
  {
    id: 5,
    studentName: 'Hoàng Thị Lan',
    studentPhone: '0956789012',
    studentEmail: 'lan.hoang@email.com',
    studentGender: 'Female',
    studentBirthDate: '2004-09-08',
    startDate: '2024-09-20',
    className: 'Python for Data Science',
    amountDue: 3500000,
    dueDate: '2024-12-05',
    daysOverdue: 17,
    contacted: false,
    parentName: 'Hoàng Văn Đức',
    parentPhone: '0943210987',
  },
  {
    id: 6,
    studentName: 'Đỗ Văn Khoa',
    studentPhone: '0967890123',
    studentEmail: 'khoa.do@email.com',
    studentGender: 'Male',
    studentBirthDate: '2005-01-30',
    startDate: '2024-08-05',
    className: 'React & Next.js',
    amountDue: 3000000,
    dueDate: '2024-12-08',
    daysOverdue: 14,
    contacted: true,
    parentName: 'Đỗ Thị Hoa',
    parentPhone: '0932109876',
  },
  {
    id: 7,
    studentName: 'Vũ Thị Mai',
    studentPhone: '0978901234',
    studentEmail: 'mai.vu@email.com',
    studentGender: 'Female',
    studentBirthDate: '2004-12-18',
    startDate: '2024-10-15',
    className: 'JavaScript Nâng Cao',
    amountDue: 2500000,
    dueDate: '2024-12-10',
    daysOverdue: 12,
    contacted: false,
    parentName: 'Vũ Văn Hải',
    parentPhone: '0921098765',
  },
  {
    id: 8,
    studentName: 'Bùi Minh Quân',
    studentPhone: '0989012345',
    studentEmail: 'quan.bui@email.com',
    studentGender: 'Male',
    studentBirthDate: '2003-06-25',
    startDate: '2024-07-01',
    className: 'Machine Learning',
    amountDue: 4500000,
    dueDate: '2024-11-12',
    daysOverdue: 40,
    contacted: true,
    parentName: 'Bùi Thị Nga',
    parentPhone: '0910987654',
  },
  {
    id: 9,
    studentName: 'Ngô Thị Thu',
    studentPhone: '0990123456',
    studentEmail: 'thu.ngo@email.com',
    studentGender: 'Female',
    studentBirthDate: '2005-04-14',
    startDate: '2024-09-10',
    className: 'UI/UX Design Fundamentals',
    amountDue: 2500000,
    dueDate: '2024-11-18',
    daysOverdue: 34,
    contacted: false,
    parentName: 'Ngô Văn Tuấn',
    parentPhone: '0909876543',
  },
  {
    id: 10,
    studentName: 'Trương Văn Đức',
    studentPhone: '0901234567',
    studentEmail: 'duc.truong@email.com',
    studentGender: 'Male',
    studentBirthDate: '2004-08-05',
    startDate: '2024-08-20',
    className: 'Python for Data Science',
    amountDue: 3500000,
    dueDate: '2024-11-28',
    daysOverdue: 24,
    contacted: true,
    parentName: 'Trương Thị Linh',
    parentPhone: '0898765432',
  },
];

type TimePeriod = '3months' | '6months' | '12months';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');

  const currentRevenueData = revenueData[selectedPeriod];

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100">
            {t('title')}
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mt-1">{t('overview')}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatsCards statsData={statsData} formatCurrency={formatCurrency} />

      {/* Charts and Overdue Payments */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 xl:grid-cols-2 items-start">
        <RevenueChart
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          currentRevenueData={currentRevenueData}
          formatCurrency={formatCurrency}
          className="w-full"
        />
        <OverduePaymentsAlert overduePayments={overduePayments} formatCurrency={formatCurrency} className="w-full" />
      </div>

      {/* Recent Classes Table */}
      <RecentClassesTable recentClasses={recentClasses} formatCurrency={formatCurrency} />
    </div>
  );
}
