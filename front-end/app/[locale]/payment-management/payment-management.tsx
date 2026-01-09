'use client';

import { useEffect, useMemo, useState } from 'react';
import { PaymentTable } from './_components/payment-table';
import { PaymentFilter, PaymentFilterState } from './_components/payment-filter';
import { PersonDetailDrawer } from './_components/person-detail-drawer';
import { formatCurrency } from '@/utils/helper';
import { paymentService } from '@/services/payment-service';
import { PaymentResponse } from '@/types';

export interface PaymentItem {
  id: number;
  invoiceId: string;
  type: 'income' | 'expense'; // Thu (học phí) hoặc Chi (lương)
  studentName?: string; // For income
  teacherName?: string; // For expense
  className?: string;
  period?: string; // Kỳ thanh toán (VD: "Tháng 12/2024", "Học kỳ 1/2024")
  totalAmount: number; // Tổng số tiền cần thanh toán
  paidAmount: number; // Số tiền đã thanh toán (có thể thanh toán nhiều lần)
  createdDate: string; // ISO datetime string
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  status: 'paid' | 'partial'; // paid: đã đủ, partial: chưa đủ
  note?: string;
}

// Mock data cho học sinh - trong thực tế sẽ fetch từ API
const mockStudents = {
  'Nguyễn Thị Mai': {
    phone: '0912345678',
    email: 'mai.nguyen@example.com',
    birthDate: '2000-05-15',
    startDate: '2024-01-01',
    parentName: 'Nguyễn Văn X',
    parentPhone: '0987654321',
  },
  'Trần Văn Nam': {
    phone: '0923456789',
    email: 'nam.tran@example.com',
    birthDate: '1999-08-20',
    startDate: '2024-02-10',
    parentName: 'Trần Thị Y',
    parentPhone: '0976543210',
  },
  'Lê Thị Hoa': {
    phone: '0934567890',
    email: 'hoa.le@example.com',
    birthDate: '2001-03-10',
    startDate: '2024-03-01',
    parentName: 'Lê Văn Z',
    parentPhone: '0965432109',
  },
  'Phạm Văn Đức': {
    phone: '0945678901',
    email: 'duc.pham@example.com',
    birthDate: '2000-11-25',
    startDate: '2024-01-01',
  },
  'Hoàng Thị Linh': {
    phone: '0956789012',
    email: 'linh.hoang@example.com',
    birthDate: '2001-07-18',
    startDate: '2024-02-15',
    parentName: 'Hoàng Văn K',
    parentPhone: '0954321098',
  },
  'Vũ Văn Hải': {
    phone: '0967890123',
    email: 'hai.vu@example.com',
    birthDate: '1999-12-05',
    startDate: '2023-12-01',
  },
  'Đặng Thị Lan': {
    phone: '0978901234',
    email: 'lan.dang@example.com',
    birthDate: '2000-09-30',
    startDate: '2024-01-20',
    parentName: 'Đặng Văn M',
    parentPhone: '0943210987',
  },
  'Bùi Văn Minh': {
    phone: '0989012345',
    email: 'minh.bui@example.com',
    birthDate: '2001-04-12',
    startDate: '2024-03-01',
  },
};

// Mock data cho giáo viên
const mockTeachers = {
  'Nguyễn Văn A': {
    phone: '0901234567',
    email: 'a.nguyen@teacher.com',
    birthDate: '1985-03-20',
    startDate: '2020-01-15',
    subject: 'JavaScript, React',
    experience: '8 năm',
  },
  'Trần Thị B': {
    phone: '0912345670',
    email: 'b.tran@teacher.com',
    birthDate: '1987-07-10',
    startDate: '2019-09-01',
    subject: 'Python, Data Science',
    experience: '10 năm',
  },
  'Lê Văn C': {
    phone: '0923456701',
    email: 'c.le@teacher.com',
    birthDate: '1990-11-05',
    startDate: '2021-03-20',
    subject: 'Web Development',
    experience: '5 năm',
  },
  'Phạm Thị D': {
    phone: '0934567012',
    email: 'd.pham@teacher.com',
    birthDate: '1988-02-28',
    startDate: '2020-06-15',
    subject: 'Full Stack Development',
    experience: '7 năm',
  },
};

export default function PaymentManagementPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [filters, setFilters] = useState<PaymentFilterState>({
    searchQuery: '',
    type: 'all',
    status: 'all',
    className: 'all',
    paymentMethod: 'all',
    sortBy: 'createdDate',
    sortOrder: 'desc',
  });
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<{
    name: string;
    type: 'student' | 'teacher';
    id?: string;
    phone?: string;
    email?: string;
    gender?: string;
    birthDate?: string;
    startDate?: string;
    className?: string;
    parentName?: string;
    parentPhone?: string;
    subject?: string;
    experience?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await paymentService.getAllPayments();
        const data = res.data.data as PaymentResponse[];

        const mapped: PaymentItem[] = data.map((p, index) => {
          const type: 'income' | 'expense' =
            p.direction === 'INCOME' ? 'income' : 'expense';

          const status: 'paid' | 'partial' =
            p.paymentStatus === 'COMPLETED' ? 'paid' : 'partial';

          const paymentMethodMap: Record<string, PaymentItem['paymentMethod']> = {
            CASH: 'cash',
            BANK_TRANSFER: 'bank_transfer',
            CREDIT_CARD: 'credit_card',
            E_WALLET: 'e_wallet',
          };

          const paymentDate =
            p.createdAt ?? p.billingMonth;

          const createdDate = paymentDate
            ? new Date(paymentDate as unknown as string).toISOString()
            : new Date().toISOString();

          const period = p.billingMonth
            ? new Date(p.billingMonth as unknown as string).toLocaleDateString('vi-VN', {
                month: '2-digit',
                year: 'numeric',
              })
            : undefined;

          return {
            id: index + 1,
            invoiceId: p.paymentId,
            type,
            studentName: undefined,
            teacherName: undefined,
            className: undefined,
            period,
            totalAmount: Number(p.feeSnapshot ?? p.amount ?? 0),
            paidAmount: Number(p.paid ?? 0),
            createdDate,
            paymentMethod: paymentMethodMap[p.paymentMethod] ?? 'cash',
            status,
            note: p.note ?? undefined,
          };
        });

        setPayments(mapped);
      } catch (err) {
        setError('Không thể tải dữ liệu thanh toán');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Handle person click to show detail drawer
  const handlePersonClick = (name: string, type: 'student' | 'teacher') => {
    let personInfo;
    let className: string | undefined;

    if (type === 'student') {
      personInfo = mockStudents[name as keyof typeof mockStudents];
      // Tìm className từ payments
      const payment = payments.find((p) => p.studentName === name);
      className = payment?.className;
    } else {
      personInfo = mockTeachers[name as keyof typeof mockTeachers];
    }

    if (personInfo) {
      setSelectedPerson({
        name,
        type,
        className,
        ...personInfo,
      });
      setIsDrawerOpen(true);
    }
  };

  // Get related payments for selected person
  const relatedPayments = useMemo(() => {
    if (!selectedPerson) return [];
    
    return payments.filter((p) => {
      if (selectedPerson.type === 'student') {
        return p.studentName === selectedPerson.name;
      } else {
        return p.teacherName === selectedPerson.name;
      }
    });
  }, [payments, selectedPerson]);

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

  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredPayments.length / pageSize));

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
        payments={paginatedPayments}
        onPersonClick={handlePersonClick}
        showActions={false}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={filteredPayments.length}
        onPageChange={setCurrentPage}
        isLoading={isLoading}
        error={error || undefined}
      />

      {/* Person Detail Drawer */}
      <PersonDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        person={selectedPerson}
        relatedPayments={relatedPayments}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
