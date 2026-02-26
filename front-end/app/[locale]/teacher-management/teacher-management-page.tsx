'use client';

import { PageLoading } from '@/components/page-loading';
import { useCreateTeacher, useDeleteTeacher, useResetTeacherPassword, useRestoreTeacher, useTeachers, useUpdateTeacher, useAssignClassesToTeacher } from '@/hooks/use-teachers';
import { TeacherFilterState, TeacherRequest, TeacherType } from '@/types';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { TeacherDialog } from './_components/teacher-dialog';
import { TeacherTable } from './_components/teacher-table';
import { TeacherFilter } from './_components/teacher-filter';
import { TeacherAssignClassesDialog } from './_components/teacher-assign-classes-dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

// Map UI gender filter -> API filter
const genderMap: Record<'all' | 'male' | 'female' | 'other', 'MALE' | 'FEMALE' | 'OTHER' | undefined> = {
  all: undefined,
  male: 'MALE',
  female: 'FEMALE',
  other: 'OTHER',
};

// Map UI status filter -> API filter (Status enum on backend)
const statusMap: Record<TeacherFilterState['status'], 'ACTIVE' | 'DELETED' | 'BLOCKED' | undefined> = {
  all: undefined,
  active: 'ACTIVE',
  deleted: 'DELETED',
  blocked: 'BLOCKED',
};

// Helper function to parse URL params into filter state
const parseFiltersFromURL = (searchParams: URLSearchParams): TeacherFilterState => {
  return {
    searchQuery: searchParams.get('search') || '',
    gender: (searchParams.get('gender') as TeacherFilterState['gender']) || 'all',
    status: (searchParams.get('status') as TeacherFilterState['status']) || 'all',
    sortBy: (searchParams.get('sortBy') as TeacherFilterState['sortBy']) || 'name',
    sortOrder: (searchParams.get('sortOrder') as TeacherFilterState['sortOrder']) || 'asc',
  };
};

// Helper function to convert filter state to URL params
const filtersToURLParams = (filters: TeacherFilterState): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (filters.searchQuery) params.set('search', filters.searchQuery);
  if (filters.gender !== 'all') params.set('gender', filters.gender);
  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.sortBy !== 'name') params.set('sortBy', filters.sortBy);
  if (filters.sortOrder !== 'asc') params.set('sortOrder', filters.sortOrder);
  
  return params;
};

export default function TeacherManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);
  const [isAssignClassesDialogOpen, setIsAssignClassesDialogOpen] = useState(false);
  const [selectedTeacherForAssign, setSelectedTeacherForAssign] = useState<TeacherType | null>(null);
  const [filters, setFilters] = useState<TeacherFilterState>(() => 
    parseFiltersFromURL(searchParams)
  );
  const isUpdatingFromURL = useRef(false);

  // Use infinite query with pagination + server-side filters
  const {
    data: teacherPages,
    isLoading,
    error: teachersError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTeachers(filters.searchQuery, {
    gender: genderMap[filters.gender],
    status: statusMap[filters.status],
  });
  
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const resetPassword = useResetTeacherPassword();
  const deleteTeacher = useDeleteTeacher();
  const restoreTeacher = useRestoreTeacher();
  const assignClasses = useAssignClassesToTeacher();

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

  // Sync filters with URL params when filters change
  useEffect(() => {
    // Skip if we're updating from URL to prevent infinite loop
    if (isUpdatingFromURL.current) {
      isUpdatingFromURL.current = false;
      return;
    }

    const urlParams = filtersToURLParams(filters);
    const currentURLParams = searchParams.toString();
    
    // Only update URL if it's different to avoid unnecessary navigation
    if (currentURLParams !== urlParams.toString()) {
      const newURL = urlParams.toString() 
        ? `${pathname}?${urlParams.toString()}`
        : pathname;
      router.replace(newURL, { scroll: false });
    }
  }, [filters, pathname, router, searchParams]);

  // Sync filters from URL params when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const urlFilters = parseFiltersFromURL(searchParams);
    const currentFiltersStr = JSON.stringify(filters);
    const urlFiltersStr = JSON.stringify(urlFilters);
    
    // Only update filters if they're actually different
    if (currentFiltersStr !== urlFiltersStr) {
      isUpdatingFromURL.current = true;
      setFilters(urlFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Apply local filters (deleted items, gender, sorting)
  const teachers = useMemo(() => {
    let result = [...teachersData];

    // Apply gender filter (client-side, in addition to server-side for safety)
    if (filters.gender !== 'all') {
      const apiGender = genderMap[filters.gender];
      if (apiGender) {
        result = result.filter((t) => t.gender === apiGender);
      }
    }

    // Apply status filter (client-side, in addition to server-side for safety)
    if (filters.status !== 'all') {
      const apiStatus = statusMap[filters.status];
      if (apiStatus) {
        result = result.filter((t) => t.status === apiStatus);
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
  }, [teachersData, filters.gender, filters.status, filters.sortBy, filters.sortOrder]);

  const handleAdd = useCallback(() => {
    setSelectedTeacher(null);
    setIsDialogOpen(true);
  }, []);

  const handleEdit = useCallback((teacher: TeacherType) => {
    setSelectedTeacher(teacher);
    setIsDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteTeacher.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    },
    [deleteTeacher],
  );

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

  const handleRestore = useCallback(
    async (id: string) => {
      try {
        await restoreTeacher.mutateAsync(id);
      } catch (error) {
        console.error('Error restoring teacher:', error);
      }
    },
    [restoreTeacher],
  );

  const handleAssignClasses = useCallback(
    (teacher: TeacherType) => {
      setSelectedTeacherForAssign(teacher);
      setIsAssignClassesDialogOpen(true);
    },
    [],
  );

  const handleSaveAssignments = useCallback(
    async (teacherId: string, classIds: string[]) => {
      try {
        await assignClasses.mutateAsync({ teacherId, classIds });
        setIsAssignClassesDialogOpen(false);
        setSelectedTeacherForAssign(null);
      } catch (error) {
        console.error('Error assigning classes:', error);
      }
    },
    [assignClasses],
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
        onRestore={handleRestore}
        onAssignClasses={handleAssignClasses}
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

      {/* Assign Classes Dialog */}
      <TeacherAssignClassesDialog
        open={isAssignClassesDialogOpen}
        onOpenChange={setIsAssignClassesDialogOpen}
        teacher={selectedTeacherForAssign}
        onSave={handleSaveAssignments}
        isSubmitting={assignClasses.isPending}
      />
    </div>
  );
}
