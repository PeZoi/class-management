'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/utils/helper';
import { ClassroomTable } from './_components/classroom-table';
import { ClassroomDialog } from './_components/classroom-dialog';
import { ClassroomRevenueChart } from './_components/classroom-revenue-chart';
import { useTranslations } from 'next-intl';
import { ClassRequest, ClassType } from '@/types/class-type';
import { classService } from '@/services/class-service';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';

type TimePeriod = '3months' | '6months' | '12months';

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

export default function ClassroomManagementPage() {
  const t = useTranslations('classroom-management');
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Chart state
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');

  const fetchClasses = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await classService.getAllClasses();
      if (response.status === 200) {
        setClasses(response.data || []);
      }
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách lớp học');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Call API to get all classes
  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = useCallback(() => {
    setSelectedClass(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((classItem: ClassType) => {
    setSelectedClass(classItem);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setClasses((prevClasses) => prevClasses.filter((c) => c.id !== id));
  }, []);

  // Type cho form data - chỉ chứa các field có trong form
  

  const handleSave = useCallback(async (formData: ClassRequest, id?: string) => {
    if (id) {
      try {
        const response = await classService.updateClass(id, formData);
        if (response.status === 200 && response.data) {
          const updatedClass = response.data;
          toast.success("Cập nhật lớp học thành công");
          setIsDialogOpen(false);
          setSelectedClass(null);
          setClasses((prevClasses) => 
            prevClasses.map((c) => c.id === id ? updatedClass : c)
          );
        }
      } catch (error) {
        console.error(error);
        toast.error("Cập nhật lớp học thất bại");
      }
    } else {
      try {
        const response = await classService.createClass(formData);
        if (response.status === 201 && response.data) {
          const newClass = response.data;
          toast.success("Thêm lớp học thành công");
          setIsDialogOpen(false);
          setSelectedClass(null);
          setClasses((prevClasses) => [...prevClasses, newClass]);
        }
      } catch (error) {
        console.error(error);
        toast.error("Thêm lớp học thất bại");
      }
    }
  }, []);

  // Get revenue data for chart - memoized to prevent recalculation
  const currentRevenueData = useMemo(
    () => revenueComparisonData[selectedPeriod],
    [selectedPeriod]
  );

  // Memoize period change handler
  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period);
  }, []);

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách lớp học..." />;
  }

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
        onPeriodChange={handlePeriodChange}
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
