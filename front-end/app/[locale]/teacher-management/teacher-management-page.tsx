'use client';

import { PageLoading } from '@/components/page-loading';
import { useCreateTeacher, useResetTeacherPassword, useTeachers, useUpdateTeacher } from '@/hooks/use-teachers';
import { TeacherFilterState, TeacherRequest, TeacherType } from '@/types';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { TeacherDialog } from './_components/teacher-dialog';
import { TeacherTable } from './_components/teacher-table';
import { TeacherFilter } from './_components/teacher-filter';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function TeacherManagementPage() {
  const router = useRouter();
  const locale = useLocale();
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);
  const [filters, setFilters] = useState<TeacherFilterState>({
    searchQuery: '',
    gender: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Map UI gender filter -> API filter
  const genderMap: Record<'all' | 'male' | 'female' | 'other', 'MALE' | 'FEMALE' | 'OTHER' | undefined> = {
    all: undefined,
    male: 'MALE',
    female: 'FEMALE',
    other: 'OTHER',
  };

  // Use infinite query with pagination + server-side filters
  const {
    data: teacherPages,
    isLoading,
    error: teachersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTeachers(filters.searchQuery, {
    gender: genderMap[filters.gender] as 'MALE' | 'FEMALE' | 'OTHER' | undefined,
  });
  
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const resetPassword = useResetTeacherPassword();

  // Flatten all pages into single array
  const teachersData = useMemo(() => {
    if (!teacherPages) return [];
    return teacherPages.pages.flatMap((page) => page.content);
  }, [teacherPages]);

  useEffect(() => {
    if (teachersError) {
      toast.error(tNotif('errorLoadTeachers'));
      console.error('Error fetching teachers:', teachersError);
    }
  }, [teachersError, tNotif]);

  // Optional: local remove for optimistic UI when child component "deletes" from table
  // (actual delete API isn't present in teacherService currently)
  const [deletedTeacherIds, setDeletedTeacherIds] = useState<string[]>([]);

  // Apply local filters (deleted items, gender, sorting)
  const teachers = useMemo(() => {
    let result = [...teachersData];

    if (deletedTeacherIds.length) {
      result = result.filter((t) => !deletedTeacherIds.includes(t.id));
    }

    // Apply gender filter (client-side, in addition to server-side for safety)
    if (filters.gender !== 'all') {
      const apiGender = genderMap[filters.gender];
      if (apiGender) {
        result = result.filter((t) => t.gender === apiGender);
      }
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName, 'vi');
          break;
        case 'joinedDate':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'totalClasses':
          comparison = (a.classList?.length || 0) - (b.classList?.length || 0);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [teachersData, deletedTeacherIds, filters.gender, filters.sortBy, filters.sortOrder]);

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
      {/* Filter Bar */}
      <TeacherFilter filters={filters} onFilterChange={setFilters} />

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

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                {tCommon('loading')}
              </>
            ) : (
              tCommon('loadMore')
            )}
          </Button>
        </div>
      )}

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
