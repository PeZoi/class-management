'use client';

import { PageLoading } from '@/components/page-loading';
import { teacherService } from '@/services';
import { TeacherRequest, TeacherType } from '@/types';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { TeacherDialog } from './_components/teacher-dialog';
import { TeacherTable } from './_components/teacher-table';

export default function TeacherManagementPage() {
  const router = useRouter();
  const locale = useLocale();
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await teacherService.getAllTeachers();
      if (response.status === 200) {
        setTeachers(response.data || []);
      }
    } catch (error) {
      toast.error('Không thể tải danh sách giáo viên');
      console.error('Error fetching teachers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = useCallback(() => {
    setSelectedTeacher(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((teacher: TeacherType) => {
    setSelectedTeacher(teacher);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSave = useCallback(
    async (teacherData: TeacherRequest) => {
      // Convert Partial<TeacherType> to TeacherRequest
      const teacherRequest: TeacherRequest = {
        fullName: teacherData.fullName || '',
        email: teacherData.email || '',
        phoneNumber: teacherData.phoneNumber || '',
        idCard: teacherData.idCard || '',
        dob: teacherData.dob || '',
        avatar: teacherData.avatar || '',
        gender: teacherData.gender || '',
      };

      if (selectedTeacher) {
        try {
          const response = await teacherService.updateTeacher(selectedTeacher.id, teacherRequest);
          if (response.status === 200 && response.data) {
            const updatedTeacher = response.data;
            toast.success('Cập nhật giảng viên thành công');
            setIsDialogOpen(false);
            setSelectedTeacher(null);
            setTeachers((prev) => prev.map((t) => (t.id === selectedTeacher.id ? { ...t, ...updatedTeacher } : t)));
          }
        } catch (error) {
          console.error('Error updating teacher:', error);
          toast.error('Cập nhật giảng viên thất bại');
        }
      } else {
        try {
          const response = await teacherService.createTeacher(teacherRequest);
          if (response.status === 201 && response.data) {
            const newTeacher = response.data;
            toast.success('Thêm giảng viên thành công');
            setIsDialogOpen(false);
            setSelectedTeacher(null);
            setTeachers((prev) => [...prev, newTeacher]);
          }
        } catch (error) {
          console.error('Error creating teacher:', error);
          toast.error('Thêm giảng viên thất bại');
        }
      }
    },
    [selectedTeacher],
  );

  const handleViewDetail = useCallback(
    (teacher: TeacherType) => {
      router.push(`/${locale}/teacher-management/${teacher.id}`);
    },
    [router, locale],
  );

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách giáo viên..." />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Teacher Table */}
      <TeacherTable
        teachers={teachers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onViewDetail={handleViewDetail}
        showActions={true}
      />

      {/* Teacher Dialog */}
      <TeacherDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} teacher={selectedTeacher} onSave={handleSave} />
    </div>
  );
}
