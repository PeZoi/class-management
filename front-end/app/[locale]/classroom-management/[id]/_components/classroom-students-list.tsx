'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { StudentType } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helper';
import { ColumnDef } from '@tanstack/react-table';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

interface ClassroomStudentsListProps {
  students: StudentType[];
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

export function ClassroomStudentsList({ students }: ClassroomStudentsListProps) {
  const t = useTranslations('classroom-detail');
  const locale = useLocale();

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
              <div>{row.original.fullName}</div>
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
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <Calendar className="size-4" />
          {t('unpaidMonths')}
        </div>
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
          <div className="text-center">
            <Link
              href={`/${locale}/student-management/${student.id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <Eye className="size-4" />
              {t('viewDetail')}
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Users className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
              {t('studentsList')}
              <span className="text-sm md:text-base font-normal text-slate-500 dark:text-slate-400">
                ({students.length})
              </span>
            </CardTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('studentsListDescription')}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mappedStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noStudentsInClass')}</p>
          </div>
        ) : (
          <DataTable columns={columns} data={mappedStudents} />
        )}
      </CardContent>
    </Card>
  );
}

