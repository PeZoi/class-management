'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/utils/helper';
import { ColumnDef } from '@tanstack/react-table';
import {
  BookOpen,
  Calendar,
  DollarSign,
  Edit,
  Mail,
  MoreHorizontal,
  Package,
  Phone,
  Plus,
  Trash2,
  User,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  CreditCard,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { StudentItem } from '@/types/student-type';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface StudentTableProps {
  students: StudentItem[];
  onEdit?: (student: StudentItem) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  onPayment?: (student: StudentItem) => void;
  title?: string;
  description?: string;
  showActions?: boolean;
  className?: string;
}

export function StudentTable({
  students,
  onEdit,
  onDelete,
  onAdd,
  onPayment,
  title,
  description,
  showActions = true,
  className,
}: StudentTableProps) {
  const t = useTranslations('student-management');
  const tCommon = useTranslations('common');
  const locale = useLocale();

  const displayTitle = title || t('title');
  const displayDescription = description || t('description');

  const getPaymentBadge = (paymentStatus: 'paid' | 'partial' | 'unpaid') => {
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
        icon: XCircle,
      },
    } as const;

    const config = paymentConfig[paymentStatus];
    const Icon = config.icon;

    return (
      <span
        className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.className)}
      >
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  };

  const columns: ColumnDef<StudentItem>[] = [
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
              <Link
                href={`/${locale}/student-management/${row.original.id}`}
                className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {row.original.fullName}
              </Link>
              <div className="text-xs text-slate-500">{t(`gender_${row.original.gender.toLowerCase()}`)}</div>
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
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.original.fullNameParent}</div>
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
              {row.original.class?.name || tCommon('noClass')}
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
          <div className="flex items-center justify-center">
            <Badge
              variant="outline"
              className="text-xs font-medium px-2 py-0.5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30"
            >
              <Clock className="size-3 mr-1" />
              {row.original.class?.shiftName || '-'}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'dob',
      header: ({ column }) => (
        <div className="flex items-center justify-center gap-2">
          <SortableHeader column={column}>
            <Calendar className="size-4" />
            {t('dob')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center text-slate-600 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
            <Calendar className="size-4 opacity-80" />
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
      id: 'unpaidPackages',
      accessorFn: (row) => {
        const currentPackage = row.sessionPaymentStatuses?.find((pkg) => pkg.isCurrent === true);
        const packageUnpaid =
          row.sessionPaymentStatuses?.filter(
            (pkg) =>
              (pkg.packageNumber ?? 0) <= (currentPackage?.packageNumber ?? 0) &&
              (pkg.status === 'UNPAID' || pkg.status === 'PARTIAL'),
          ) ?? [];
        return packageUnpaid.length;
      },
      header: ({ column }) => (
        <div className="flex items-center justify-center gap-2">
          <SortableHeader column={column} className="justify-center">
            <Package className="size-4" />
            {t('unpaidMonths')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        const currentPackage = row.original.sessionPaymentStatuses?.find((pkg) => pkg.isCurrent === true);
        const packageUnpaid =
          row.original.sessionPaymentStatuses?.filter(
            (pkg) =>
              (pkg.packageNumber ?? 0) <= (currentPackage?.packageNumber ?? 0) &&
              (pkg.status === 'UNPAID' || pkg.status === 'PARTIAL'),
          ) ?? [];
        const packageUnpaidCount = packageUnpaid.length;

        return (
          <div className="text-center">
            <Badge variant="outline" className="font-semibold flex items-center justify-center gap-1.5 w-fit mx-auto">
              <Package className="size-3.5" />
              {packageUnpaidCount}
            </Badge>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.getValue<number>('unpaidPackages') ?? 0;
        const b = rowB.getValue<number>('unpaidPackages') ?? 0;
        return a - b;
      },
    },
    {
      id: 'payment',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <DollarSign className="size-4" />
          {t('payment')}
        </div>
      ),
      cell: ({ row }) => {
        // Tìm package hiện tại từ sessionPaymentStatuses (có isCurrent = true)
        const currentPackage = row.original.sessionPaymentStatuses?.find((pkg) => pkg.isCurrent === true);

        // Lấy số tiền đã đóng và cần đóng của package hiện tại
        // Format: (số tiền đã đóng của package hiện tại / số tiền cần đóng)
        const currentPackagePaidAmount =
          currentPackage?.paidAmount ?? row.original.currentMonthPaidAmount ?? row.original.amountPaid ?? 0;
        const currentPackageExpectedAmount = currentPackage?.expectedAmount ?? row.original.monthlyFee ?? 0;

        // Tính tổng nợ: tổng remainingAmount của tất cả các package từ trước đến gói hiện tại (<= currentPackageNumber)
        let totalDebt = 0;

        const currentPackageNumber = currentPackage?.packageNumber;

        if (currentPackageNumber != null) {
          totalDebt = row.original.sessionPaymentStatuses?.filter((pkg) => (pkg.packageNumber ?? 0) <= currentPackageNumber)?.reduce((sum, pkg) => sum + (pkg.remainingAmount || 0), 0) ?? 0;
        } else {
          // Nếu không xác định được currentPackage, fallback: tính nợ của tất cả package
          totalDebt = row.original.sessionPaymentStatuses?.reduce(
            (sum, pkg) => sum + (pkg.remainingAmount || 0),
            0,
          ) ?? 0;
        }

        if (!currentPackage) {
          return (
            <div className="text-right space-y-1.5">
              <div className="space-y-1">
                <Badge variant="outline" className="font-semibold gap-1.5 w-fit">
                  {tCommon('noData')}
                </Badge>
              </div>
            </div>
          );
        }

        return (
          <div className="text-right space-y-1.5">
            {/* Current package payment status */}
            <div className="space-y-1">
              {getPaymentBadge(row.original.paymentStatus)}
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatCurrency(currentPackagePaidAmount)} / {formatCurrency(currentPackageExpectedAmount)}
              </div>
            </div>
            {/* Total debt from unpaid packages */}
            {totalDebt > 0 && (
              <div className="text-xs font-bold text-red-600 dark:text-red-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                {t('debtLabel')} {formatCurrency(totalDebt)}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  if (showActions) {
    columns.push({
      id: 'actions',
      header: () => <div className="text-center">{t('actions')}</div>,
      cell: ({ row }) => {
        const student = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="size-8 p-0">
                  <span className="sr-only">{t('openMenu')}</span>
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href={`/${locale}/student-management/${student.id}`} className="flex items-center">
                    <Eye className="size-4 mr-2" />
                    {t('viewDetail')}
                  </Link>
                </DropdownMenuItem>
                {onPayment && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onPayment(student)}>
                    <CreditCard className="size-4 mr-2" />
                    {t('payment')}
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(student)}>
                    <Edit className="size-4 mr-2" />
                    {t('edit')}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 dark:text-red-400"
                    onClick={() => {
                      if (window.confirm(t('confirmDelete'))) {
                        onDelete(student.id);
                      }
                    }}
                  >
                    <Trash2 className="size-4 mr-2" />
                    {t('delete')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    });
  }

  return (
    <Card
      className={cn(
        'hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg',
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">{displayTitle}</CardTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{displayDescription}</p>
          </div>
          {showActions && onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="size-4" />
              <span className="hidden sm:inline">{t('addStudent')}</span>
              <span className="sm:hidden">{t('addStudentShort')}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noStudentsFound')}</p>
          </div>
        ) : (
          <DataTable columns={columns} data={students} />
        )}
      </CardContent>
    </Card>
  );
}
