'use client';

import { PageLoading } from '@/components/page-loading';
import {
  useClasses,
  useMyClasses,
  useClassRevenueData,
  useCreateClass,
  useUpdateClass,
} from '@/hooks/use-classes';
import { ClassRequest, ClassRevenueDataResponse, ClassType } from '@/types/class-type';
import { formatCurrency } from '@/utils/helper';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { ClassroomDialog } from './_components/classroom-dialog';
import { ClassroomRevenueChart } from './_components/classroom-revenue-chart';
import { ClassroomTable } from './_components/classroom-table';
import { TimePeriod } from '@/types/common-type';
import { useAuthStore } from '@/store';

// Màu sắc cho từng lớp học (sẽ map động từ classes)
const colorPalette = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#f59e0b', // Orange
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f97316', // Orange-600
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

export default function ClassroomManagementPage() {
  const t = useTranslations('classroom-management');
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');

  // Check if user is teacher
  const isTeacher = user?.role === 'ROLE_TEACHER';

  // Sử dụng TanStack Query hooks - teacher chỉ thấy lớp của mình
  const {
    data: allClasses = [],
    isLoading: isLoadingAll,
    error: allClassesError,
  } = useClasses();

  const {
    data: teacherClasses = [],
    isLoading: isLoadingTeacher,
    error: teacherClassesError,
  } = useMyClasses();

  // Chọn classes dựa trên role
  const classes = isTeacher ? teacherClasses : allClasses;
  const isLoading = isTeacher ? isLoadingTeacher : isLoadingAll;
  const classesError = isTeacher ? teacherClassesError : allClassesError;

  const {
    data: revenueDataResponse = [],
    isLoading: isLoadingRevenue,
    error: revenueError,
  } = useClassRevenueData(selectedPeriod);

  const createClass = useCreateClass();
  const updateClass = useUpdateClass();

  // Hiển thị error toast nếu có lỗi
  useEffect(() => {
    if (classesError) {
      toast.error(tNotif('errorLoadClasses'));
    }
  }, [classesError, tNotif]);

  useEffect(() => {
    if (revenueError) {
      toast.error(tNotif('errorLoadRevenue'));
    }
  }, [revenueError, tNotif]);

  // Map revenue data từ BE sang format mà component cần
  const revenueData = useMemo(() => {
    return revenueDataResponse.map((item: ClassRevenueDataResponse) => {
      const revenueItem: { month: string; label: string; [key: string]: string | number } = {
        month: item.month,
        label: item.label,
      };

      // Map classRevenues từ Map sang object
      Object.entries(item.classRevenues || {}).forEach(([key, value]) => {
        revenueItem[key] = value || 0;
      });

      return revenueItem;
    });
  }, [revenueDataResponse]);

  const handleAdd = useCallback(() => {
    setSelectedClass(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((classItem: ClassType) => {
    setSelectedClass(classItem);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    // Chỉ xóa khỏi UI, không có API delete
    // Nếu có API delete sau này, có thể thêm mutation ở đây
    console.log('Delete class:', id);
  }, []);

  const handleSave = useCallback(
    async (formData: ClassRequest, id?: string) => {
      if (id) {
        await updateClass.mutateAsync({ id, data: formData });
      } else {
        await createClass.mutateAsync(formData);
      }
      setIsDialogOpen(false);
      setSelectedClass(null);
    },
    [createClass, updateClass]
  );

  const isSavingClass = createClass.isPending || updateClass.isPending;

  // Map classes to classColors dynamically
  // Sort classes by id to match BE order (BE sorts classes by id before mapping to class_1, class_2, ...)
  const classColors = useMemo(() => {
    const sortedClasses = [...classes].sort((a, b) => a.id.localeCompare(b.id));
    return sortedClasses.map((cls, index) => ({
      id: index + 1, // 1-based index to match BE format (class_1, class_2, ...)
      name: cls.name,
      color: colorPalette[index % colorPalette.length],
    }));
  }, [classes]);

  // Memoize period change handler
  const handlePeriodChange = useCallback((period: TimePeriod) => {
    setSelectedPeriod(period);
  }, []);

  if (isLoading) {
    return <PageLoading message={tCommon('loadingClasses')} />;
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      <ClassroomTable
        classes={classes}
        formatCurrency={formatCurrency}
        onEdit={isTeacher ? undefined : handleEdit}
        onDelete={isTeacher ? undefined : handleDelete}
        onAdd={isTeacher ? undefined : handleAdd}
        title={t('title')}
        description={t('description')}
        showActions={!isTeacher}
      />

      {/* Revenue Chart - Only show for admin */}
      {!isTeacher && (
        <ClassroomRevenueChart
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          revenueData={revenueData}
          formatCurrency={formatCurrency}
          classNames={classColors}
          isLoading={isLoadingRevenue}
        />
      )}

      <ClassroomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        classItem={selectedClass}
        onSave={handleSave}
        isSubmitting={isSavingClass}
      />
    </div>
  );
}
