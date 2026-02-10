'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { PaymentTable } from './_components/payment-table';
import { PaymentFilter } from './_components/payment-filter';
import { PersonDetailDrawer } from './_components/person-detail-drawer';
import { PaymentResponse, PaymentItem, PaymentFilterState } from '@/types';
import { PageLoading } from '@/components/page-loading';
import { useLocale, useTranslations } from 'next-intl';
import { usePayments } from '@/hooks/use-payments';
import { useStudent } from '@/hooks/use-students';
import { useTeacher } from '@/hooks/use-teachers';

// Helper function to parse URL params into filter state
const parseFiltersFromURL = (searchParams: URLSearchParams): PaymentFilterState => {
  return {
    searchQuery: searchParams.get('search') || '',
    type: (searchParams.get('type') as PaymentFilterState['type']) || 'all',
    status: (searchParams.get('status') as PaymentFilterState['status']) || 'all',
    className: searchParams.get('class') || 'all',
    paymentMethod: (searchParams.get('method') as PaymentFilterState['paymentMethod']) || 'all',
    sortBy: (searchParams.get('sortBy') as PaymentFilterState['sortBy']) || 'createdDate',
    sortOrder: (searchParams.get('sortOrder') as PaymentFilterState['sortOrder']) || 'desc',
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentItem | null>(null);
  const t = useTranslations('payment-management');
  const tNotif = useTranslations('notifications');
  const isUpdatingFromURL = useRef(false);

  const paymentsQuery = usePayments();

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
    const data = (paymentsQuery.data ?? []) as PaymentResponse[];
    const dateLocale = locale === 'vi' ? 'vi-VN' : 'en-US';

    return data.map((p: PaymentResponse, index: number) => {
      const type: 'income' | 'expense' = p.direction === 'INCOME' ? 'income' : 'expense';
      const status: 'paid' | 'partial' = p.paymentStatus === 'COMPLETED' ? 'paid' : 'partial';

      const paymentMethodMap: Record<string, PaymentItem['paymentMethod']> = {
        CASH: 'cash',
        BANK_TRANSFER: 'bank_transfer',
        CREDIT_CARD: 'credit_card',
        E_WALLET: 'e_wallet',
      };

      const paymentDate = p.createdAt ?? p.billingMonth;
      const createdDate = paymentDate ? new Date(paymentDate as unknown as string).toISOString() : new Date().toISOString();

      const period = p.billingMonth
        ? new Date(p.billingMonth as unknown as string).toLocaleDateString(dateLocale, {
            month: '2-digit',
            year: 'numeric',
          })
        : undefined;

      return {
        id: index + 1,
        backendId: p.id,
        invoiceId: p.paymentId,
        type,
        studentId: p.student?.id,
        teacherId: p.teacher?.id,
        studentName: p.student?.fullName,
        teacherName: p.teacher?.fullName,
        studentGender: p.student?.gender,
        teacherGender: p.teacher?.gender,
        className: p.class?.name,
        period,
        totalAmount: Number(p.feeSnapshot ?? p.amount ?? 0),
        paidAmount: Number(p.paid ?? 0),
        createdDate,
        paymentMethod: paymentMethodMap[p.paymentMethod] ?? 'cash',
        status,
        note: p.note ?? undefined,
        // Teacher salary details (only for expense type)
        feeSnapshot: p.feeSnapshot ? Number(p.feeSnapshot) : undefined,
        bonus: p.bonus ? Number(p.bonus) : undefined,
        deduction: p.deduction ? Number(p.deduction) : undefined,
      };
    });
  }, [paymentsQuery.data, locale]);

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


  // Get unique class names for filter
  const availableClasses = useMemo(() => {
    const classes = [...new Set(payments.map((p) => p.className).filter((c): c is string => !!c))];
    return classes.sort();
  }, [payments]);

  // Filter and sort payments
  const filteredPayments = useMemo(() => {
    let result = [...payments];

    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter((payment) => payment.type === filters.type);
    }

    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter((payment) => payment.status === filters.status);
    }

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (payment) =>
          payment.invoiceId.toLowerCase().includes(query) ||
          (payment.studentName && payment.studentName.toLowerCase().includes(query)) ||
          (payment.teacherName && payment.teacherName.toLowerCase().includes(query)) ||
          (payment.className && payment.className.toLowerCase().includes(query))
      );
    }

    // Apply class filter
    if (filters.className !== 'all') {
      result = result.filter((payment) => payment.className === filters.className);
    }

    // Apply payment method filter
    if (filters.paymentMethod !== 'all') {
      result = result.filter((payment) => payment.paymentMethod === filters.paymentMethod);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'studentName':
          const nameA = a.studentName || a.teacherName || '';
          const nameB = b.studentName || b.teacherName || '';
          comparison = nameA.localeCompare(nameB, 'vi');
          break;
        case 'createdDate':
          comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
          break;
        case 'amount':
          comparison = a.totalAmount - b.totalAmount;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [payments, filters]);

  if (paymentsQuery.isLoading) {
    return <PageLoading message={t('loading')} />;
  }

  const errorMessage = paymentsQuery.isError ? tNotif('errorLoadPaymentData') : null;

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Filter and Search */}
      <PaymentFilter
        filters={filters}
        onFilterChange={setFilters}
        availableClasses={availableClasses}
      />

      {/* Payment Table */}
      <PaymentTable
        payments={filteredPayments}
        onPersonClick={handlePersonClick}
        showActions={true}
        isLoading={false}
        error={errorMessage || undefined}
      />

      {/* Person Detail Drawer */}
      <PersonDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPayment(null);
        }}
        person={selectedPerson}
      />
    </div>
  );
}
