'use client';

import { useCreateStudent, useStudents, useUpdateStudent, useDeleteStudents, useRestoreStudent } from '@/hooks/use-students';
import { useClasses } from '@/hooks/use-classes';
import { StudentRequest, StudentType, FilterState, StudentItem } from '@/types/student-type';
import { SessionPaymentStatus } from '@/types/payment-type';
import { PageResponse } from '@/types';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PaymentCalendarDialog } from './_components/payment-calendar-dialog';
import { StudentDialog } from './_components/student-dialog';
import { StudentFilter } from './_components/student-filter';
import { StudentTable } from './_components/student-table';

export const NO_CLASS_FILTER_VALUE = '__no_class__';

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

  // Status đã có từ API (StudentStatus: ACTIVE, INACTIVE, GRADUATED, DELETED)
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
    studentStatus: (searchParams.get('studentStatus') as FilterState['studentStatus']) || 'ACTIVE',
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
  if (filters.studentStatus && filters.studentStatus !== 'ACTIVE') params.set('studentStatus', filters.studentStatus);
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
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const isUpdatingFromURL = useRef(false);

  // Get all classes from database for filter
  const classesQuery = useClasses();

  // Build filters object for pagination
  const paginationFilters = useMemo(() => {
    const genderMap: Record<'male' | 'female' | 'other' | 'all', 'MALE' | 'FEMALE' | 'OTHER' | undefined> = {
      male: 'MALE',
      female: 'FEMALE',
      other: 'OTHER',
      all: undefined,
    };
    const statusMap: Record<string, 'ACTIVE' | 'INACTIVE' | 'GRADUATED' | 'DELETED' | undefined> = {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE',
      GRADUATED: 'GRADUATED',
      DELETED: 'DELETED',
      all: undefined,
    };
    
    // Map sortBy from UI to backend field names
    const sortByMap: Record<string, string> = {
      name: 'fullName',
      joinedDate: 'joinAt',
      unpaidPackages: 'unpaidPackages',
    };
    
    return {
      gender: genderMap[filters.gender as 'male' | 'female' | 'other' | 'all'] || undefined,
      status: statusMap[filters.studentStatus || 'all'] || undefined,
      className: filters.className === NO_CLASS_FILTER_VALUE 
        ? NO_CLASS_FILTER_VALUE 
        : (filters.className !== 'all' ? filters.className : undefined),
      sortBy: sortByMap[filters.sortBy] || 'fullName',
      sortOrder: filters.sortOrder || 'asc',
    };
  }, [filters.gender, filters.studentStatus, filters.className, filters.sortBy, filters.sortOrder]);

  // TanStack Query hooks - use paginated query
  const studentsQuery = useStudents(
    filters.searchQuery,
    paginationFilters,
    pageIndex,
    pageSize,
  );
  
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudents = useDeleteStudents();
  const restoreStudent = useRestoreStudent();
  
  const studentsPage = studentsQuery.data as PageResponse<StudentType> | undefined;

  // Current page data
  const studentsData = useMemo(() => {
    if (!studentsPage) return [];
    return studentsPage.content;
  }, [studentsPage]);

  // Map API students -> UI students
  const students = useMemo(() => {
    return studentsData.map((student: StudentType) => mapStudentTypeToStudentItem(student));
  }, [studentsData]);

  // Handle filter change - reset pagination when filters change (including sort)
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPageIndex(0);
    setPageSize(10);
  };

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
      // Error toast đã được handle trong hook, rethrow để ConfirmDialog giữ dialog mở
      throw error;
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreStudent.mutateAsync(id);
    } catch (error) {
      console.error('Error restoring student:', error);
      // Error toast đã được handle trong hook, rethrow để ConfirmDialog giữ dialog mở
      throw error;
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

  const availableClasses = useMemo(() => {
    if (!classesQuery.data) return [];
    
    // IMPORTANT: don't use translated text as filter "value" (breaks when locale changes)
    // We keep stable values, and only translate labels in the filter UI.
    const options = classesQuery.data
      .map((cls) => ({ value: cls.name, label: cls.name, id: cls.id }))
      .filter((opt): opt is { value: string; label: string; id: string } => !!opt.value)
      .sort((a, b) => a.label.localeCompare(b.label));

    // Add "No class" option at the beginning
    options.unshift({ value: NO_CLASS_FILTER_VALUE, label: tCommon('noClass'), id: '' });

    return options;
  }, [classesQuery.data, tCommon]);

  // Filter students (client-side for payment status only, sorting is handled by backend)
  // Note: search, gender, status, className, sortBy, sortOrder are handled by backend pagination
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Apply payment status filter (client-side only, backend doesn't support this yet)
    if (filters.paymentStatus !== 'all') {
      result = result.filter((student) => student.paymentStatus === filters.paymentStatus);
    }

    // Sorting and class filtering are now handled by backend, no client-side filtering needed

    return result;
  }, [students, filters.paymentStatus]);

  const errorMessage = studentsQuery.isError ? tCommon('errorLoadData') : null;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Filter and Search - Always visible */}
      <StudentFilter filters={filters} onFilterChange={handleFilterChange} availableClasses={availableClasses} />

      {/* Student Table */}
      <StudentTable
        students={filteredStudents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onAdd={handleAdd}
        onPayment={handlePayment}
        showActions={true}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalItems={studentsPage?.totalElements}
        onPageChange={(newPage) => {
          setPageIndex(newPage);
        }}
        onPageSizeChange={(newSize) => {
          setPageIndex(0);
          setPageSize(newSize);
        }}
        isLoading={studentsQuery.isLoading}
        error={errorMessage || undefined}
      />

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
