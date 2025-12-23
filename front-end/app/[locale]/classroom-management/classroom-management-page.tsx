'use client';

import { useState } from 'react';
import { formatCurrency } from '@/utils/helper';
import { ClassroomTable } from './_components/classroom-table';
import { ClassroomDialog } from './_components/classroom-dialog';
import { ClassroomRevenueChart } from './_components/classroom-revenue-chart';
import { useTranslations } from 'next-intl';

type TimePeriod = '3months' | '6months' | '12months';

interface ClassItem {
  id: number;
  name: string;
  teacher: string;
  students: number;
  revenue: number;
  schedule: string;
  duration: string;
  tuitionFee: number;
  collected: number;
  total: number;
}

// Màu sắc cho từng lớp học
const classColors = [
  { id: 1, name: 'JavaScript Nâng Cao', color: '#3b82f6' }, // Blue
  { id: 2, name: 'React & Next.js', color: '#8b5cf6' }, // Purple
  { id: 3, name: 'Python for Data Science', color: '#10b981' }, // Green
  { id: 4, name: 'UI/UX Design Fundamentals', color: '#f59e0b' }, // Orange
  { id: 5, name: 'Machine Learning', color: '#ef4444' }, // Red
];

// Dữ liệu doanh thu so sánh tất cả các lớp theo tháng
const revenueComparisonData: Record<
  TimePeriod,
  Array<{
    month: string;
    label: string;
    class_1: number;
    class_2: number;
    class_3: number;
    class_4: number;
    class_5: number;
  }>
> = {
  '3months': [
    {
      month: 'T10',
      label: 'Tháng 10',
      class_1: 87500000,
      class_2: 126000000,
      class_3: 98000000,
      class_4: 75000000,
      class_5: 112500000,
    },
    {
      month: 'T11',
      label: 'Tháng 11',
      class_1: 87500000,
      class_2: 120000000,
      class_3: 98000000,
      class_4: 70000000,
      class_5: 105000000,
    },
    {
      month: 'T12',
      label: 'Tháng 12',
      class_1: 87500000,
      class_2: 126000000,
      class_3: 98000000,
      class_4: 75000000,
      class_5: 112500000,
    },
  ],
  '6months': [
    {
      month: 'T7',
      label: 'Tháng 7',
      class_1: 85000000,
      class_2: 120000000,
      class_3: 95000000,
      class_4: 72000000,
      class_5: 108000000,
    },
    {
      month: 'T8',
      label: 'Tháng 8',
      class_1: 86000000,
      class_2: 123000000,
      class_3: 96000000,
      class_4: 73000000,
      class_5: 110000000,
    },
    {
      month: 'T9',
      label: 'Tháng 9',
      class_1: 87000000,
      class_2: 125000000,
      class_3: 97000000,
      class_4: 74000000,
      class_5: 111000000,
    },
    {
      month: 'T10',
      label: 'Tháng 10',
      class_1: 87500000,
      class_2: 126000000,
      class_3: 98000000,
      class_4: 75000000,
      class_5: 112500000,
    },
    {
      month: 'T11',
      label: 'Tháng 11',
      class_1: 87500000,
      class_2: 120000000,
      class_3: 98000000,
      class_4: 70000000,
      class_5: 105000000,
    },
    {
      month: 'T12',
      label: 'Tháng 12',
      class_1: 87500000,
      class_2: 126000000,
      class_3: 98000000,
      class_4: 75000000,
      class_5: 112500000,
    },
  ],
  '12months': [
    {
      month: 'T1',
      label: 'Tháng 1',
      class_1: 80000000,
      class_2: 115000000,
      class_3: 90000000,
      class_4: 68000000,
      class_5: 100000000,
    },
    {
      month: 'T2',
      label: 'Tháng 2',
      class_1: 81000000,
      class_2: 116000000,
      class_3: 91000000,
      class_4: 69000000,
      class_5: 102000000,
    },
    {
      month: 'T3',
      label: 'Tháng 3',
      class_1: 82000000,
      class_2: 117000000,
      class_3: 92000000,
      class_4: 70000000,
      class_5: 104000000,
    },
    {
      month: 'T4',
      label: 'Tháng 4',
      class_1: 83000000,
      class_2: 118000000,
      class_3: 93000000,
      class_4: 71000000,
      class_5: 106000000,
    },
    {
      month: 'T5',
      label: 'Tháng 5',
      class_1: 84000000,
      class_2: 119000000,
      class_3: 94000000,
      class_4: 71500000,
      class_5: 107000000,
    },
    {
      month: 'T6',
      label: 'Tháng 6',
      class_1: 85000000,
      class_2: 120000000,
      class_3: 95000000,
      class_4: 72000000,
      class_5: 108000000,
    },
    {
      month: 'T7',
      label: 'Tháng 7',
      class_1: 85000000,
      class_2: 120000000,
      class_3: 95000000,
      class_4: 72000000,
      class_5: 108000000,
    },
    {
      month: 'T8',
      label: 'Tháng 8',
      class_1: 86000000,
      class_2: 123000000,
      class_3: 96000000,
      class_4: 73000000,
      class_5: 110000000,
    },
    {
      month: 'T9',
      label: 'Tháng 9',
      class_1: 87000000,
      class_2: 125000000,
      class_3: 97000000,
      class_4: 74000000,
      class_5: 111000000,
    },
    {
      month: 'T10',
      label: 'Tháng 10',
      class_1: 87500000,
      class_2: 126000000,
      class_3: 98000000,
      class_4: 75000000,
      class_5: 112500000,
    },
    {
      month: 'T11',
      label: 'Tháng 11',
      class_1: 87500000,
      class_2: 120000000,
      class_3: 98000000,
      class_4: 70000000,
      class_5: 105000000,
    },
    {
      month: 'T12',
      label: 'Tháng 12',
      class_1: 87500000,
      class_2: 126000000,
      class_3: 98000000,
      class_4: 75000000,
      class_5: 112500000,
    },
  ],
};

const initialClasses: ClassItem[] = [
  {
    id: 1,
    name: 'JavaScript Nâng Cao',
    teacher: 'Nguyễn Văn A',
    students: 35,
    revenue: 87500000,
    schedule: 'T2, T4, T6 - 19:00',
    duration: '3 tháng',
    tuitionFee: 2500000,
    collected: 87500000,
    total: 87500000,
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

export default function ClassroomManagementPage() {
  const t = useTranslations('classroom-management');
  const [classes, setClasses] = useState<ClassItem[]>(initialClasses);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  // Chart state
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');

  const handleAdd = () => {
    setSelectedClass(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (classItem: ClassItem) => {
    setSelectedClass(classItem);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setClasses(classes.filter((c) => c.id !== id));
  };

  const handleSave = (classItem: ClassItem) => {
    if (selectedClass) {
      // Edit
      setClasses(classes.map((c) => (c.id === classItem.id ? classItem : c)));
    } else {
      // Add
      const newClass = {
        ...classItem,
        id: Math.max(...classes.map((c) => c.id), 0) + 1,
      };
      setClasses([...classes, newClass]);
    }
    setIsDialogOpen(false);
    setSelectedClass(null);
  };

  // Get revenue data for chart
  const currentRevenueData = revenueComparisonData[selectedPeriod];

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      <ClassroomTable
        classes={classes}
        formatCurrency={formatCurrency}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        title={t('title')}
        description={t('description')}
        showActions={true}
      />

      {/* Revenue Chart */}
      <ClassroomRevenueChart
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        revenueData={currentRevenueData}
        formatCurrency={formatCurrency}
        classNames={classColors}
      />

      <ClassroomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        classItem={selectedClass}
        onSave={handleSave}
      />
    </div>
  );
}
