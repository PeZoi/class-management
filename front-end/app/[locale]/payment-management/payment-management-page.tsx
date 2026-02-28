'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PaymentTable } from './_components/payment-table';
import { PaymentFilter } from './_components/payment-filter';
import { PersonDetailDrawer } from './_components/person-detail-drawer';
import { PaymentResponse, PaymentItem, PaymentFilterState, PageResponse } from '@/types';
import { useLocale, useTranslations } from 'next-intl';
import { usePaymentsPaginated } from '@/hooks/use-payments';
import { useStudent } from '@/hooks/use-students';
import { useTeacher } from '@/hooks/use-teachers';
import { useClasses } from '@/hooks/use-classes';

// Helper function to parse URL params into filter state
const parseFiltersFromURL = (searchParams: URLSearchParams): PaymentFilterState => {
  const startDateParam = searchParams.get('startDate');
  const endDateParam = searchParams.get('endDate');
  
  return {
    searchQuery: searchParams.get('search') || '',
    type: (searchParams.get('type') as PaymentFilterState['type']) || 'all',
    status: (searchParams.get('status') as PaymentFilterState['status']) || 'all',
    className: searchParams.get('class') || 'all',
    paymentMethod: (searchParams.get('method') as PaymentFilterState['paymentMethod']) || 'all',
    sortBy: (searchParams.get('sortBy') as PaymentFilterState['sortBy']) || 'createdDate',
    sortOrder: (searchParams.get('sortOrder') as PaymentFilterState['sortOrder']) || 'desc',
    startDate: startDateParam ? startDateParam.split('-').join('/') : undefined,
    endDate: endDateParam ? endDateParam.split('-').join('/') : undefined,
  };
};

// Helper function to convert filter state to URL params
const filtersToURLParams = (filters: PaymentFilterState): URLSearchParams => {
  const params = new URLSearchParams();
  
  if (filters.searchQuery) params.set('search', filters.searchQuery);
  if (filters.type !== 'all') params.set('type', filters.type);
  if (filters.status !== 'all') params.set('status', filters.status);
  if (filters.className !== 'all') params.set('class', filters.className);
  if (filters.paymentMethod !== 'all') params.set('method', filters.paymentMethod);
  if (filters.startDate) params.set('startDate', filters.startDate?.split('/').join('-'));
  if (filters.endDate) params.set('endDate', filters.endDate?.split('/').join('-'));
  if (filters.sortBy !== 'createdDate') params.set('sortBy', filters.sortBy);
  if (filters.sortOrder !== 'desc') params.set('sortOrder', filters.sortOrder);
  
  return params;
};

export default function PaymentManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  
  const [filters, setFilters] = useState<PaymentFilterState>(() => 
    parseFiltersFromURL(searchParams)
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const tNotif = useTranslations('notifications');
  const isUpdatingFromURL = useRef(false);

  const handleFilterChange = (newFilters: PaymentFilterState) => {
    setFilters(newFilters);
    // Reset pagination when user changes filters from UI
    setPageIndex(0);
    setPageSize(10);
  };

  // Helper to convert UI date (dd/MM/yyyy) to ISO string for backend filtering
  const toIsoDateTime = (dateStr?: string, isEndOfDay: boolean = false): string | undefined => {
    if (!dateStr) return undefined;

    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return undefined;

    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      isEndOfDay ? 23 : 0,
      isEndOfDay ? 59 : 0,
      isEndOfDay ? 59 : 0,
      isEndOfDay ? 999 : 0,
    );

    if (Number.isNaN(date.getTime())) return undefined;

    return date.toISOString();
  };

  // Build filters object for pagination
  const paginationFilters = useMemo(
    () => ({
      direction:
        filters.type === 'income'
          ? ('INCOME' as const)
          : filters.type === 'expense'
          ? ('EXPENSE' as const)
          : undefined,
      paymentStatus:
        filters.status === 'paid'
          ? ('COMPLETED' as const)
          : filters.status === 'partial'
          ? ('INCOMPLETE' as const)
          : undefined,
      className: filters.className !== 'all' ? filters.className : undefined,
      paymentMethod:
        filters.paymentMethod === 'cash'
          ? ('CASH' as const)
          : filters.paymentMethod === 'bank_transfer'
          ? ('BANK_TRANSFER' as const)
          : filters.paymentMethod === 'credit_card'
          ? ('CREDIT_CARD' as const)
          : filters.paymentMethod === 'e_wallet'
          ? ('E_WALLET' as const)
          : undefined,
      // Convert UI date (dd/MM/yyyy) to ISO for backend (@DateTimeFormat ISO.DATE_TIME)
      startDate: toIsoDateTime(filters.startDate, false),
      endDate: toIsoDateTime(filters.endDate, true),
      // Sorting from UI -> pass directly; mapping to BE fields is handled in paymentService / backend
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [
      filters.type,
      filters.status,
      filters.paymentMethod,
      filters.className,
      filters.startDate,
      filters.endDate,
      filters.sortBy,
      filters.sortOrder,
    ],
  );

  const paymentsQuery = usePaymentsPaginated(
    filters.searchQuery,
    paginationFilters,
    pageIndex,
    pageSize,
  );

  const paymentsPage = paymentsQuery.data as PageResponse<PaymentResponse> | undefined;

  // Current page data
  const paymentsData = useMemo(() => {
    if (!paymentsPage) return [];
    return paymentsPage.content;
  }, [paymentsPage]);

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

  const payments: PaymentItem[] = useMemo(() => {
    const data = (paymentsData ?? []) as PaymentResponse[];
    const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

    return data.map((p: PaymentResponse, index: number) => {
      // Safe defaults in case of missing data
      const type: 'income' | 'expense' = p?.direction === 'INCOME' ? 'income' : 'expense';
      const status: 'paid' | 'partial' = p?.paymentStatus === 'COMPLETED' ? 'paid' : 'partial';

      const paymentMethodMap: Record<string, PaymentItem['paymentMethod']> = {
        CASH: 'cash',
        BANK_TRANSFER: 'bank_transfer',
        CREDIT_CARD: 'credit_card',
        E_WALLET: 'e_wallet',
      };

      const paymentDate = p?.createdAt ?? p?.billingMonth;
      const createdDate = paymentDate ? new Date(paymentDate as unknown as string).toISOString() : new Date().toISOString();

      const period = p?.billingMonth
        ? new Date(p.billingMonth as unknown as string).toLocaleDateString(dateLocale, {
            month: '2-digit',
            year: 'numeric',
          })
        : undefined;

      return {
        id: index + 1,
        backendId: p?.id ?? '',
        invoiceId: p?.paymentId ?? '',
        type,
        studentId: p?.student?.id,
        teacherId: p?.teacher?.id,
        studentName: p?.student?.fullName,
        teacherName: p?.teacher?.fullName,
        studentGender: p?.student?.gender,
        teacherGender: p?.teacher?.gender,
        className: p?.clazz?.name ?? p?.class?.name,
        period,
        totalAmount: Number(p?.feeSnapshot ?? p?.amount ?? 0),
        paidAmount: Number(p?.paid ?? 0),
        createdDate,
        paymentMethod: paymentMethodMap[p?.paymentMethod ?? 'CASH'] ?? 'cash',
        status,
        note: p?.note ?? undefined,
        // Teacher salary details (only for expense type)
        feeSnapshot: p?.feeSnapshot ? Number(p.feeSnapshot) : undefined,
        bonus: p?.bonus ? Number(p.bonus) : undefined,
        deduction: p?.deduction ? Number(p.deduction) : undefined,
      };
    });
  }, [paymentsData, locale]);

  const selectedPersonType = selectedPayment?.type === 'income' ? 'student' : selectedPayment ? 'teacher' : null;
  const selectedStudentId = selectedPersonType === 'student' ? selectedPayment?.studentId : undefined;
  const selectedTeacherId = selectedPersonType === 'teacher' ? selectedPayment?.teacherId : undefined;

  const studentQuery = useStudent(selectedStudentId ?? '');
  const teacherQuery = useTeacher(selectedTeacherId ?? '');

  const selectedPerson = useMemo(() => {
    if (!selectedPayment || !selectedPersonType) return null;

    const base = {
      name: selectedPersonType === 'student' ? (selectedPayment.studentName ?? '') : (selectedPayment.teacherName ?? ''),
      type: selectedPersonType as 'student' | 'teacher',
      className: selectedPayment.className,
      gender: selectedPersonType === 'student' ? selectedPayment.studentGender : selectedPayment.teacherGender,
      id: selectedPersonType === 'student' ? selectedPayment.studentId : selectedPayment.teacherId,
    };

    if (selectedPersonType === 'student' && studentQuery.data) {
      const s = studentQuery.data;
      return {
        ...base,
        id: s.id,
        phone: s.phoneNumber,
        email: s.email,
        birthDate: s.dob,
        startDate: s.class?.joinAt,
        className: s.class?.name || base.className,
        parentName: s.fullNameParent,
        parentPhone: s.phoneNumberParent,
      };
    }

    if (selectedPersonType === 'teacher' && teacherQuery.data) {
      const te = teacherQuery.data;
      return {
        ...base,
        id: te.id,
        phone: te.phoneNumber,
        email: te.email,
        birthDate: te.dob,
        startDate: te.createdAt,
        subject: te.classList?.[0]?.name,
      };
    }

    return base;
  }, [selectedPayment, selectedPersonType, studentQuery.data, teacherQuery.data]);

  const handlePersonClick = (payment: PaymentItem) => {
    setSelectedPayment(payment);
    setIsDrawerOpen(true);
  };

  // Get all classes from database for filter
  const classesQuery = useClasses();
  const availableClasses = useMemo(() => {
    if (!classesQuery.data) return [];
    // Lấy tất cả tên lớp từ database và sắp xếp
    const classNames = classesQuery.data.map((cls) => cls.name).filter((name): name is string => !!name);
    return [...new Set(classNames)].sort();
  }, [classesQuery.data]);

  // Filter and sort payments
  // Note: type, status, search, paymentMethod, className, and sorting are handled by backend pagination
  // We keep this memo mainly to avoid re-renders and potential future client-only filters
  const filteredPayments = useMemo(() => {
    return [...payments];
  }, [payments]);

  const errorMessage = paymentsQuery.isError ? tNotif('errorLoadPaymentData') : null;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Filter and Search - Always visible */}
      <PaymentFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        availableClasses={availableClasses}
      />

      {/* Payment Table */}
      <PaymentTable
        payments={filteredPayments}
        onPersonClick={handlePersonClick}
        showActions={true}
        isLoading={paymentsQuery.isLoading}
        error={errorMessage || undefined}
        pageIndex={pageIndex}
        pageSize={pageSize}
        totalItems={paymentsPage?.totalElements}
        onPageChange={(newPage) => {
          setPageIndex(newPage);
        }}
        onPageSizeChange={(newSize) => {
          setPageIndex(0);
          setPageSize(newSize);
        }}
      />

      {/* Person Detail Drawer */}
      <PersonDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPayment(null);
        }}
        person={selectedPerson}
        isLoading={
          (selectedPersonType === 'student' && studentQuery.isLoading) ||
          (selectedPersonType === 'teacher' && teacherQuery.isLoading)
        }
      />
    </div>
  );
}
