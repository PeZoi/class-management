'use client';

import { useMemo, useState } from 'react';
import { PaymentTable } from './_components/payment-table';
import { PaymentFilter, PaymentFilterState } from './_components/payment-filter';
import { PersonDetailDrawer } from './_components/person-detail-drawer';
import { formatCurrency } from '@/utils/helper';

export interface PaymentItem {
  id: number;
  invoiceId: string;
  type: 'income' | 'expense'; // Thu (học phí) hoặc Chi (lương)
  studentName?: string; // For income
  teacherName?: string; // For expense
  className?: string;
  totalAmount: number; // Tổng số tiền cần thanh toán
  paidAmount: number; // Số tiền đã thanh toán (có thể thanh toán nhiều lần)
  createdDate: string; // ISO datetime string
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  status: 'paid' | 'partial'; // paid: đã đủ, partial: chưa đủ
  notes?: string;
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

// Mock data - trong thực tế sẽ fetch từ API
const initialPayments: PaymentItem[] = [
  // Hóa đơn THU (Học phí)
  {
    id: 1,
    invoiceId: 'INV001234',
    type: 'income',
    studentName: 'Nguyễn Thị Mai',
    className: 'JavaScript Nâng Cao',
    totalAmount: 5000000,
    paidAmount: 5000000,
    createdDate: '2024-01-15T14:30:25',
    paymentMethod: 'bank_transfer',
    status: 'paid',
    notes: 'Thanh toán đầy đủ học phí',
  },
  {
    id: 2,
    invoiceId: 'INV001235',
    type: 'income',
    studentName: 'Trần Văn Nam',
    className: 'React Cơ Bản',
    totalAmount: 4500000,
    paidAmount: 2500000,
    createdDate: '2024-02-20T09:15:42',
    paymentMethod: 'cash',
    status: 'partial',
    notes: 'Đã đóng 2.5tr, còn lại 2tr',
  },
  {
    id: 3,
    invoiceId: 'INV001236',
    type: 'income',
    studentName: 'Lê Thị Hoa',
    className: 'Python Căn Bản',
    totalAmount: 4000000,
    paidAmount: 4000000,
    createdDate: '2024-03-10T16:45:10',
    paymentMethod: 'bank_transfer',
    status: 'paid',
    notes: 'Chuyển khoản đầy đủ',
  },
  {
    id: 4,
    invoiceId: 'INV001237',
    type: 'income',
    studentName: 'Phạm Văn Đức',
    className: 'JavaScript Nâng Cao',
    totalAmount: 15000000,
    paidAmount: 15000000,
    createdDate: '2024-01-05T11:20:33',
    paymentMethod: 'e_wallet',
    status: 'paid',
    notes: 'Đóng trước 3 tháng (5tr x 3)',
  },
  {
    id: 5,
    invoiceId: 'INV001238',
    type: 'income',
    studentName: 'Hoàng Thị Linh',
    className: 'React Cơ Bản',
    totalAmount: 4500000,
    paidAmount: 1500000,
    createdDate: '2024-02-15T13:55:18',
    paymentMethod: 'bank_transfer',
    status: 'partial',
    notes: 'Đợt 1: 1.5tr',
  },
  {
    id: 6,
    invoiceId: 'INV001239',
    type: 'income',
    studentName: 'Vũ Văn Hải',
    className: 'Python Căn Bản',
    totalAmount: 8000000,
    paidAmount: 8000000,
    createdDate: '2023-12-20T10:30:45',
    paymentMethod: 'credit_card',
    status: 'paid',
    notes: 'Đóng trước 2 tháng',
  },
  {
    id: 7,
    invoiceId: 'INV001240',
    type: 'income',
    studentName: 'Đặng Thị Lan',
    className: 'JavaScript Nâng Cao',
    totalAmount: 5000000,
    paidAmount: 3000000,
    createdDate: '2024-01-25T15:10:22',
    paymentMethod: 'cash',
    status: 'partial',
    notes: 'Đã đóng 3tr, còn 2tr',
  },
  {
    id: 8,
    invoiceId: 'INV001241',
    type: 'income',
    studentName: 'Bùi Văn Minh',
    className: 'React Cơ Bản',
    totalAmount: 4500000,
    paidAmount: 4500000,
    createdDate: '2024-03-01T08:45:55',
    paymentMethod: 'bank_transfer',
    status: 'paid',
    notes: 'Thanh toán đầy đủ',
  },
  // Hóa đơn CHI (Lương giáo viên)
  {
    id: 9,
    invoiceId: 'SAL001201',
    type: 'expense',
    teacherName: 'Nguyễn Văn A',
    totalAmount: 15000000,
    paidAmount: 15000000,
    createdDate: '2024-01-31T17:00:00',
    paymentMethod: 'bank_transfer',
    status: 'paid',
    notes: 'Lương tháng 1/2024 - Đầy đủ',
  },
  {
    id: 10,
    invoiceId: 'SAL001202',
    type: 'expense',
    teacherName: 'Trần Thị B',
    totalAmount: 18000000,
    paidAmount: 18000000,
    createdDate: '2024-01-31T17:15:30',
    paymentMethod: 'bank_transfer',
    status: 'paid',
    notes: 'Lương tháng 1/2024 + thưởng',
  },
  {
    id: 11,
    invoiceId: 'SAL001203',
    type: 'expense',
    teacherName: 'Lê Văn C',
    totalAmount: 12000000,
    paidAmount: 6000000,
    createdDate: '2024-02-28T16:45:15',
    paymentMethod: 'bank_transfer',
    status: 'partial',
    notes: 'Tạm ứng 50% lương tháng 2',
  },
  {
    id: 12,
    invoiceId: 'SAL001204',
    type: 'expense',
    teacherName: 'Phạm Thị D',
    totalAmount: 14000000,
    paidAmount: 7000000,
    createdDate: '2024-03-31T18:20:40',
    paymentMethod: 'cash',
    status: 'partial',
    notes: 'Tạm ứng 50% - Còn lại trả cuối tháng',
  },
];

export default function PaymentManagementPage() {
  const [payments] = useState<PaymentItem[]>(initialPayments);
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
        showActions={false}
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
