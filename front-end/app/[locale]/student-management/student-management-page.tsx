'use client';

import { PageLoading } from '@/components/page-loading';
import { useCreateStudent, useStudents, useUpdateStudent, useDeleteStudents } from '@/hooks/use-students';
import { StudentRequest, StudentType, FilterState, StudentItem } from '@/types/student-type';
import { SessionPaymentStatus } from '@/types/payment-type';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PaymentCalendarDialog } from './_components/payment-calendar-dialog';
import { StudentDialog } from './_components/student-dialog';
import { StudentFilter } from './_components/student-filter';
import { StudentTable } from './_components/student-table';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const NO_CLASS_FILTER_VALUE = '__no_class__';

// Helper function to get current month payment status
const getCurrentMonthPaymentStatus = (
  monthPaymentStatuses?: Array<{
    month: string;
    expectedAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'PAID' | 'PARTIAL' | 'UNPAID';
  }>,
  monthlyFee?: number,
): {
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  expectedAmount: number;
} => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // Tìm payment status của tháng hiện tại
  if (monthPaymentStatuses && monthPaymentStatuses.length > 0) {
    for (const paymentStatus of monthPaymentStatuses) {
      const paymentDate = new Date(paymentStatus.month);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth() + 1;

      if (paymentYear === currentYear && paymentMonth === currentMonth) {
        // Convert status từ API format (PAID, PARTIAL, UNPAID) sang component format
        const statusMap: Record<'PAID' | 'PARTIAL' | 'UNPAID', 'paid' | 'unpaid' | 'partial'> = {
          PAID: 'paid',
          PARTIAL: 'partial',
          UNPAID: 'unpaid',
        };

        return {
          paymentStatus: statusMap[paymentStatus.status] || 'unpaid',
          paidAmount: paymentStatus.paidAmount || 0,
          expectedAmount: paymentStatus.expectedAmount || monthlyFee || 0,
        };
      }
    }
  }

  // Nếu không tìm thấy tháng hiện tại, trả về unpaid
  return {
    paymentStatus: 'unpaid',
    paidAmount: 0,
    expectedAmount: monthlyFee || 0,
  };
};

// Helper function to map API StudentType to StudentItem
const mapStudentTypeToStudentItem = (student: StudentType): StudentItem => {
  // Lấy monthly fee từ class hoặc fallback
  const monthlyFee = student.class?.monthlyFee || 0;

  // Ưu tiên sử dụng sessionPaymentStatuses (cách mới)
  let paymentStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';
  let paidAmount = 0;

  const currentPackage = student.sessionPaymentStatuses?.find((pkg: SessionPaymentStatus) => pkg.isCurrent === true);
  if (currentPackage) {
    // Convert status từ API format (PAID, PARTIAL, UNPAID) sang component format
    const statusMap: Record<'PAID' | 'PARTIAL' | 'UNPAID', 'paid' | 'unpaid' | 'partial'> = {
      PAID: 'paid',
      PARTIAL: 'partial',
      UNPAID: 'unpaid',
    };
    const pkgStatus = currentPackage.status as 'PAID' | 'PARTIAL' | 'UNPAID';
    paymentStatus = statusMap[pkgStatus] || 'unpaid';
    paidAmount = currentPackage.paidAmount || 0;
  } else {
    // Fallback về monthPaymentStatuses (cách cũ)
    const currentMonthPayment = getCurrentMonthPaymentStatus(student.monthPaymentStatuses, monthlyFee);
    paymentStatus = currentMonthPayment.paymentStatus;
    paidAmount = currentMonthPayment.paidAmount;
  }

  // Status đã có từ API (StudentStatus: ACTIVE, INACTIVE, GRADUATED, DROPPED_OUT, DELETED)
  // Không cần tạo fake status nữa, sử dụng trực tiếp từ student.status

  return {
    ...student,
    idCard: '', // Not available in API, set empty
    // status đã có trong student (kế thừa từ StudentType)
    paymentStatus,
    monthlyFee,
    amountPaid: paidAmount,
    currentMonthPaidAmount: paidAmount,
  };
};

// Helper function to parse URL params into filter state
const parseFiltersFromURL = (searchParams: URLSearchParams): FilterState => {
  return {
    searchQuery: searchParams.get('search') || '',
    paymentStatus: (searchParams.get('paymentStatus') as FilterState['paymentStatus']) || 'all',
    studentStatus: (searchParams.get('studentStatus') as FilterState['studentStatus']) || 'all',
    className: searchParams.get('class') || 'all',
    gender: (searchParams.get('gender') as FilterState['gender']) || 'all',
    sortBy: (searchParams.get('sortBy') as FilterState['sortBy']) || 'name',
    sortOrder: (searchParams.get('sortOrder') as FilterState['sortOrder']) || 'asc',
  };
};

// Helper function to convert filter state to URL params
const filtersToURLParams = (filters: FilterState): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (filters.searchQuery) params.set('search', filters.searchQuery);
  if (filters.paymentStatus !== 'all') params.set('paymentStatus', filters.paymentStatus);
  if (filters.studentStatus && filters.studentStatus !== 'all') params.set('studentStatus', filters.studentStatus);
  if (filters.className !== 'all') params.set('class', filters.className);
  if (filters.gender !== 'all') params.set('gender', filters.gender);
  if (filters.sortBy !== 'name') params.set('sortBy', filters.sortBy);
  if (filters.sortOrder !== 'asc') params.set('sortOrder', filters.sortOrder);
  
  return params;
};

export default function StudentManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const tCommon = useTranslations('common');

  // State declarations - must come before hooks that use them
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [studentForPayment, setStudentForPayment] = useState<{ id: string; fullName: string } | null>(null);
  const [filters, setFilters] = useState<FilterState>(() => 
    parseFiltersFromURL(searchParams)
  );
  const isUpdatingFromURL = useRef(false);

  // TanStack Query hooks - use infinite query with pagination
  const {
    data: studentPages,
    isLoading,
    error: studentsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStudents(filters.searchQuery);
  
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudents = useDeleteStudents();
  
  // Flatten all pages into single array
  const studentsData = useMemo(() => {
    if (!studentPages) return [];
    return studentPages.pages.flatMap(page => page.content);
  }, [studentPages]);

  // Map API students -> UI students
  const students = useMemo(() => {
    return studentsData.map((student) => mapStudentTypeToStudentItem(student));
  }, [studentsData]);

  // Show error toast if fetch students fail
  useEffect(() => {
    if (studentsError) {
      // Dùng thông báo generic để tránh leak chi tiết lỗi
      // (toast key đã có trong notifications)
      // Không throw để UI vẫn hiển thị được state rỗng
      console.error('Error fetching students:', studentsError);
    }
  }, [studentsError]);

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

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (student: StudentItem) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      // Pass single ID as string, hook will convert to array
      await deleteStudents.mutateAsync(id);
    } catch (error) {
      console.error('Error deleting student:', error);
      // Error toast đã được handle trong hook
    }
  };

  const handlePayment = (student: StudentItem) => {
    setStudentForPayment({ id: student.id, fullName: student.fullName });
    setIsPaymentDialogOpen(true);
  };

  // Handle payment success - TanStack payment hooks sẽ tự invalidate students/dashboard
  const handlePaymentSuccess = () => {
    // Không cần làm gì, để TanStack Query lo
  };

  const handleSave = async (studentData: StudentRequest) => {
    // Chuẩn hóa dữ liệu: nếu classShiftId là chuỗi rỗng hoặc không có ca học, loại bỏ khỏi payload
    const normalizedData: StudentRequest = {
      ...studentData,
    };
    
    // Loại bỏ classShiftId nếu rỗng để tránh lỗi khi lớp chưa có ca học
    if (!normalizedData.classShiftId || normalizedData.classShiftId.trim() === '') {
      delete normalizedData.classShiftId;
    }

    // Update existing student
    if (selectedStudent) {
      try {
        await updateStudent.mutateAsync({ id: selectedStudent.id, data: normalizedData });
        setIsDialogOpen(false);
        setSelectedStudent(null);
      } catch (error) {
        console.error('Error updating student:', error);
        // Error toast đã được handle trong hook, không cần toast thêm
      }
      return;
    }

    // Add new student
    try {
      await createStudent.mutateAsync(normalizedData);
      setIsDialogOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error creating student:', error);
      // Error toast đã được handle trong hook
    }
  };

  // Get unique class names for filter
  const availableClasses = useMemo(() => {
    // IMPORTANT: don't use translated text as filter "value" (breaks when locale changes)
    // We keep stable values, and only translate labels in the filter UI.
    const classNames = new Set<string>();
    let hasNoClass = false;

    for (const s of students) {
      if (s.class?.name) classNames.add(s.class.name);
      else hasNoClass = true;
    }

    const options = Array.from(classNames)
      .sort()
      .map((name) => ({ value: name, label: name }));

    if (hasNoClass) {
      options.unshift({ value: NO_CLASS_FILTER_VALUE, label: tCommon('noClass') });
    }

    return options;
  }, [students, tCommon]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.fullName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.phoneNumber.includes(query) ||
          student.fullNameParent.toLowerCase().includes(query) ||
          (student.class?.name || '').toLowerCase().includes(query),
      );
    }

    // Apply payment status filter
    if (filters.paymentStatus !== 'all') {
      result = result.filter((student) => student.paymentStatus === filters.paymentStatus);
    }

    // Apply student status filter
    if (filters.studentStatus && filters.studentStatus !== 'all') {
      result = result.filter((student) => student.status === filters.studentStatus);
    }

    // Apply class filter
    if (filters.className !== 'all') {
      result = result.filter((student) => {
        const classValue = student.class?.name ? student.class.name : NO_CLASS_FILTER_VALUE;
        return classValue === filters.className;
      });
    }

    // Apply gender filter
    if (filters.gender !== 'all') {
      const genderMap: Record<'male' | 'female' | 'other', 'MALE' | 'FEMALE' | 'OTHER'> = {
        male: 'MALE',
        female: 'FEMALE',
        other: 'OTHER',
      };
      result = result.filter((student) => student.gender === genderMap[filters.gender as 'male' | 'female' | 'other']);
    }

    // Apply sorting
    result.sort((a, b) => {
      // First: Sort by student status if "all" is selected (ACTIVE -> INACTIVE -> GRADUATED -> DROPPED_OUT -> DELETED)
      if (!filters.studentStatus || filters.studentStatus === 'all') {
        const statusOrder = { ACTIVE: 0, INACTIVE: 1, GRADUATED: 2, DROPPED_OUT: 3, DELETED: 4 };
        const statusA = a.status ? statusOrder[a.status] ?? 99 : 99;
        const statusB = b.status ? statusOrder[b.status] ?? 99 : 99;
        
        if (statusA !== statusB) {
          return statusA - statusB;
        }
      }

      // Second: Apply user-selected sorting
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName, 'vi');
          break;
        case 'joinedDate':
          comparison = new Date(a.class?.joinAt || '').getTime() - new Date(b.class?.joinAt || '').getTime();
          break;
        case 'monthlyFee':
          comparison = a.monthlyFee - b.monthlyFee;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, filters.searchQuery, filters.paymentStatus, filters.studentStatus, filters.className, filters.gender, filters.sortBy, filters.sortOrder]);

  if (isLoading) {
    return <PageLoading message={tCommon('loadingStudents')} />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Filter and Search */}
      <StudentFilter filters={filters} onFilterChange={setFilters} availableClasses={availableClasses} />

      {/* Student Table */}
      <StudentTable
        students={filteredStudents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onPayment={handlePayment}
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

      {/* Student Dialog */}
      <StudentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        student={selectedStudent}
        onSave={handleSave}
        isSubmitting={createStudent.isPending || updateStudent.isPending}
      />

      {/* Payment Calendar Dialog */}
      <PaymentCalendarDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        student={studentForPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
