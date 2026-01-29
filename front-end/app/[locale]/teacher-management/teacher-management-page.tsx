'use client';

import { PageLoading } from '@/components/page-loading';
import { useCreateTeacher, useResetTeacherPassword, useTeachers, useUpdateTeacher } from '@/hooks/use-teachers';
import { TeacherRequest, TeacherType } from '@/types';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { TeacherDialog } from './_components/teacher-dialog';
import { TeacherTable } from './_components/teacher-table';

export default function TeacherManagementPage() {
  const router = useRouter();
  const locale = useLocale();
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);

  const { data: teachersData = [], isLoading, error: teachersError } = useTeachers();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const resetPassword = useResetTeacherPassword();

  useEffect(() => {
    if (teachersError) {
      toast.error(tNotif('errorLoadTeachers'));
      console.error('Error fetching teachers:', teachersError);
    }
  }, [teachersError, tNotif]);

  // Optional: local remove for optimistic UI when child component "deletes" from table
  // (actual delete API isn't present in teacherService currently)
  const [deletedTeacherIds, setDeletedTeacherIds] = useState<string[]>([]);
  const teachers = useMemo(() => {
    if (!deletedTeacherIds.length) return teachersData;
    return teachersData.filter((t) => !deletedTeacherIds.includes(t.id));
  }, [teachersData, deletedTeacherIds]);

  const handleAdd = useCallback(() => {
    setSelectedTeacher(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((teacher: TeacherType) => {
    setSelectedTeacher(teacher);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeletedTeacherIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
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
          await updateTeacher.mutateAsync({ id: selectedTeacher.id, data: teacherRequest });
          setIsDialogOpen(false);
          setSelectedTeacher(null);
        } catch (error) {
          console.error('Error updating teacher:', error);
        }
      } else {
        try {
          await createTeacher.mutateAsync(teacherRequest);
          setIsDialogOpen(false);
          setSelectedTeacher(null);
        } catch (error) {
          console.error('Error creating teacher:', error);
        }
      }
    },
    [createTeacher, selectedTeacher, updateTeacher],
  );

  const handleViewDetail = useCallback(
    (teacher: TeacherType) => {
      router.push(`/${locale}/teacher-management/${teacher.id}`);
    },
    [router, locale],
  );

  const handleResetPassword = useCallback(
    async (teacher: TeacherType) => {
      try {
        await resetPassword.mutateAsync(teacher.id as string);
      } catch (error) {
        console.error('Error resetting password:', error);
      }
    },
    [resetPassword],
  );

  if (isLoading) {
    return <PageLoading message={tCommon('loadingTeachers')} />;
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
        onResetPassword={handleResetPassword}
        showActions={true}
      />

      {/* Teacher Dialog */}
      <TeacherDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        teacher={selectedTeacher}
        onSave={handleSave}
        isSubmitting={createTeacher.isPending || updateTeacher.isPending}
      />
    </div>
  );
}
