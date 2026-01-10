'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatCurrency } from '@/utils/helper';
import { ClassroomTable } from './_components/classroom-table';
import { ClassroomDialog } from './_components/classroom-dialog';
import { ClassroomRevenueChart } from './_components/classroom-revenue-chart';
import { useTranslations } from 'next-intl';
import { ClassRequest, ClassType, ClassRevenueDataResponse } from '@/types/class-type';
import { classService } from '@/services/class-service';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';

type TimePeriod = '3months' | '6months' | '12months';

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
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);

  // Chart state
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');
  const [revenueData, setRevenueData] = useState<Array<{
    month: string;
    label: string;
    [key: string]: string | number;
  }>>([]);

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

  // Fetch revenue data from BE
  const fetchRevenueData = useCallback(async (period: TimePeriod) => {
    try {
      setIsLoadingRevenue(true);
      const response = await classService.getRevenueDataByPeriod(period);
      if (response.status === 200 && response.data) {
        // Map dữ liệu từ BE sang format mà component cần
        const mappedData = response.data.map((item: ClassRevenueDataResponse) => {
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
        
        setRevenueData(mappedData);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error('Không thể tải dữ liệu doanh thu');
      setRevenueData([]);
    } finally {
      setIsLoadingRevenue(false);
    }
  }, []);

  // Call API to get all classes
  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch revenue data when period changes
  useEffect(() => {
    fetchRevenueData(selectedPeriod);
  }, [selectedPeriod, fetchRevenueData]);

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
      {!isLoadingRevenue && revenueData.length > 0 && (
        <ClassroomRevenueChart
          selectedPeriod={selectedPeriod}
          onPeriodChange={handlePeriodChange}
          revenueData={revenueData}
          formatCurrency={formatCurrency}
          classNames={classColors}
        />
      )}

      <ClassroomDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        classItem={selectedClass}
        onSave={handleSave}
      />
    </div>
  );
}
