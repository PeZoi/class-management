'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { StudentType } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helper';
import { ColumnDef } from '@tanstack/react-table';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  User,
  Users,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface ClassroomStudentsListProps {
  students: StudentType[];
  onEditStudent?: (student: StudentType) => void;
  onPayment?: (student: StudentType) => void;
}

interface ClassroomStudentItem extends StudentType {
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  monthlyFee: number;
  amountPaid: number;
  currentMonthPaidAmount?: number;
}

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
  const currentMonth = currentDate.getMonth() + 1;

  if (monthPaymentStatuses && monthPaymentStatuses.length > 0) {
    for (const paymentStatus of monthPaymentStatuses) {
      const paymentDate = new Date(paymentStatus.month);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth() + 1;

      if (paymentYear === currentYear && paymentMonth === currentMonth) {
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

  return {
    paymentStatus: 'unpaid',
    paidAmount: 0,
    expectedAmount: monthlyFee || 0,
  };
};

export function ClassroomStudentsList({ students, onEditStudent, onPayment }: ClassroomStudentsListProps) {
  const t = useTranslations('classroom-detail');
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState('');

  const mappedStudents: ClassroomStudentItem[] = students.map((student) => {
    const monthlyFee = student.class?.monthlyFee || 0;
    const currentMonthPayment = getCurrentMonthPaymentStatus(student.monthPaymentStatuses, monthlyFee);

    return {
      ...student,
      paymentStatus: currentMonthPayment.paymentStatus,
      monthlyFee,
      amountPaid: currentMonthPayment.paidAmount,
      currentMonthPaidAmount: currentMonthPayment.paidAmount,
    };
  });

  // Filter students by search query (search in name, email, phone, parent name)
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) {
      return mappedStudents;
    }

    const query = searchQuery.toLowerCase().trim();
    return mappedStudents.filter((student) => {
      const fullName = student.fullName?.toLowerCase() || '';
      const email = student.email?.toLowerCase() || '';
      const phoneNumber = student.phoneNumber?.toLowerCase() || '';
      const parentName = student.fullNameParent?.toLowerCase() || '';
      const parentPhone = student.phoneNumberParent?.toLowerCase() || '';

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        phoneNumber.includes(query) ||
        parentName.includes(query) ||
        parentPhone.includes(query)
      );
    });
  }, [mappedStudents, searchQuery]);

  const getPaymentBadge = (paymentStatus: ClassroomStudentItem['paymentStatus']) => {
    const paymentConfig = {
      paid: {
        label: t('payment_paid'),
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
      },
      partial: {
        label: t('payment_partial'),
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: Clock,
      },
      unpaid: {
        label: t('payment_unpaid'),
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: Clock,
      },
    } as const;

    const config = paymentConfig[paymentStatus];
    const Icon = config.icon;

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
          config.className,
        )}
      >
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  };

  const columns: ColumnDef<ClassroomStudentItem>[] = [
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <User className="size-4" />
            {t('studentName')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-slate-900 dark:text-slate-100">
            <div className="space-y-0.5">
              <Link href={`/student-management/${row.original.id}`} className="hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">{row.original.fullName}</Link>
              <div className="text-xs text-slate-500">
                {t(`gender_${row.original.gender.toLowerCase()}`)}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'contact',
      header: () => (
        <div className="flex items-center gap-2">
          <Mail className="size-4" />
          {t('contact')}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Mail className="size-3.5 text-slate-500" />
              <span className="text-xs">{row.original.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Phone className="size-3.5 text-slate-500" />
              <span className="text-xs">{row.original.phoneNumber}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'fullNameParent',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <Users className="size-4" />
            {t('parent')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {row.original.fullNameParent}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="size-3 text-slate-500" />
              {row.original.phoneNumberParent}
            </div>
          </div>
        );
      },
    },
    {
      id: 'class',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <BookOpen className="size-4" />
          {t('class')}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
              {row.original.class?.name || t('noClass')}
            </span>
          </div>
        );
      },
    },
    {
      id: 'shift',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <Clock className="size-4" />
          <span>{t('shift')}</span>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center text-slate-600 dark:text-slate-400 text-sm">
            {row.original.class?.shiftName || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'dob',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="size-4" />
            {t('dob')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center text-slate-600 dark:text-slate-400 text-sm">
            {formatDate(row.original.dob)}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.dob).getTime();
        const dateB = new Date(rowB.original.dob).getTime();
        return dateA - dateB;
      },
    },
    {
      id: 'unpaidMonths',
      accessorFn: (row) => {
        return row.monthPaymentStatuses?.filter((m) => m.remainingAmount > 0).length ?? 0;
      },
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="size-4" />
            {t('unpaidMonths')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const unpaidMonths =
          row.original.monthPaymentStatuses?.filter((m) => m.remainingAmount > 0).length ?? 0;
        return (
          <div className="text-center text-slate-700 dark:text-slate-300 text-sm font-medium">
            {unpaidMonths}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const unpaidMonthsA =
          rowA.original.monthPaymentStatuses?.filter((m) => m.remainingAmount > 0).length ?? 0;
        const unpaidMonthsB =
          rowB.original.monthPaymentStatuses?.filter((m) => m.remainingAmount > 0).length ?? 0;
        return unpaidMonthsA - unpaidMonthsB;
      },
    },
    {
      id: 'payment',
      header: () => (
        <div className="flex items-center justify-end gap-2">
          <DollarSign className="size-4" />
          {t('payment')}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-right space-y-1">
            {getPaymentBadge(row.original.paymentStatus)}
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {formatCurrency(row.original.currentMonthPaidAmount ?? row.original.amountPaid)} /{' '}
              {formatCurrency(row.original.monthlyFee)}
            </div>
          </div>
        );
      },
    },
    {
      id: 'joinedAt',
      accessorFn: (row) => row.class?.joinAt || '',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="size-4" />
            {t('joinedAt')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center text-slate-600 dark:text-slate-400 text-sm">
            {formatDate(row.original.class?.joinAt || '')}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.class?.joinAt ? new Date(rowA.original.class.joinAt).getTime() : 0;
        const dateB = rowB.original.class?.joinAt ? new Date(rowB.original.class.joinAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="text-center">
          {t('actions')}
        </div>
      ),
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <span className="sr-only">{t('openMenu') || 'Mở menu hành động'}</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link
                    href={`/${locale}/student-management/${student.id}`}
                    className="flex items-center"
                  >
                    <Eye className="size-4 mr-2" />
                    {t('viewDetail')}
                  </Link>
                </DropdownMenuItem>
                {onPayment && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onPayment(student)}>
                    <CreditCard className="size-4 mr-2" />
                    {t('payment') || 'Đóng tiền'}
                  </DropdownMenuItem>
                )}
                {onEditStudent && (
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onEditStudent(student)}
                  >
                    <Edit className="size-4 mr-2" />
                    {t('editInfo') || 'Sửa thông tin'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Users className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
                {t('studentsList')}
                <span className="text-sm md:text-base font-normal text-slate-500 dark:text-slate-400">
                  ({searchQuery ? filteredStudents.length : students.length})
                  {searchQuery && filteredStudents.length !== students.length && (
                    <span className="text-slate-400"> / {students.length}</span>
                  )}
                </span>
              </CardTitle>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t('studentsListDescription')}
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 md:size-5 text-slate-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 md:h-12 pl-9 md:pl-12 pr-9 md:pr-12 text-sm md:text-base bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-lg shadow-sm hover:shadow-md focus-visible:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500/20 transition-all"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 size-8 h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="size-4 text-slate-400" />
                <span className="sr-only">{t('clearSearch') || 'Xóa tìm kiếm'}</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mappedStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noStudentsInClass')}</p>
          </div>
        ) : filteredStudents.length === 0 && searchQuery ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('noSearchResults') || 'Không tìm thấy học viên nào phù hợp với'} &quot;{searchQuery}&quot;
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="mt-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <X className="size-4 mr-1" />
              {t('clearFilter') || 'Xóa bộ lọc'}
            </Button>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredStudents} />
        )}
      </CardContent>
    </Card>
  );
}

