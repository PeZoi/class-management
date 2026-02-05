'use client';

import { Badge } from '@/components/ui/badge';
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
import { ClassType } from '@/types/class-type';
import { ColumnDef } from '@tanstack/react-table';
import {
  BookOpen,
  Calendar,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
  Users,
  Wallet,
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

interface ClassroomTableProps {
  classes: ClassType[];
  formatCurrency: (amount: number) => string;
  onEdit?: (classItem: ClassType) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  title?: string;
  description?: string;
  showActions?: boolean;
  className?: string;
}

export function ClassroomTable({
  classes,
  formatCurrency,
  onEdit,
  onDelete,
  onAdd,
  title,
  description,
  showActions = true,
  className,
}: ClassroomTableProps) {
  const t = useTranslations('classroom-management');
  const tDashboard = useTranslations('dashboard');
  const locale = useLocale();

  const displayTitle = title || t('title');
  const displayDescription = description || t('description');

  const columns: ColumnDef<ClassType>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4" />
            {t('className')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium">
            <Link
              href={`/${locale}/classroom-management/${row.original.id}`}
              className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {row.original.name}
            </Link>
          </div>
        );
      },
    },
    {
      accessorKey: 'teacher.fullName',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <User className="size-4" />
            {t('teacher')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-slate-900 dark:text-slate-100">
            <div className="space-y-0.5">
              <div>{row.original.teacher.fullName}</div>
              <div className="text-xs text-slate-500">
                {row.original.teacher.gender === 'MALE'
                  ? tDashboard('gender_male')
                  : row.original.teacher.gender === 'FEMALE'
                    ? tDashboard('gender_female')
                    : tDashboard('gender_other')}
              </div>
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.teacher.fullName.localeCompare(rowB.original.teacher.fullName);
      },
    },
    {
      accessorKey: 'studentCount',
      header: ({ column }) => (
        <div className="flex items-center justify-center gap-2">
          <SortableHeader column={column} className="justify-center">
            <Users className="size-4" />
            {t('students')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <Badge variant="outline" className="font-semibold">
              {row.original.studentCount}
            </Badge>
          </div>
        );
      },
    },
    {
      id: 'schedule',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            {t('schedule')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const classShifts = row.original.classShifts ?? [];
        return (
          <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-400">
            {classShifts.length > 0 ? (
              classShifts.map((shift) => (
                <div className="flex items-center gap-1.5" key={shift.id}>
                  <Calendar className="size-3.5 mt-0.5" />
                  {shift.name}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-1.5 italic">
                <Calendar className="size-3.5 mt-0.5" />
                {t('noSchedule')}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'monthlyFee',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <Wallet className="size-4" />
            {t('monthlyFee')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(row.original.monthlyFee)}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('perStudent')}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.monthlyFee - rowB.original.monthlyFee;
      },
    },
    {
      id: 'paymentStatus',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <CreditCard className="size-4" />
          {t('paymentStatus')}
        </div>
      ),
      cell: ({ row }) => {
        const classItem = row.original;
        const total = classItem.total || 0;
        const collected = classItem.collected || 0;
        const percentage = total > 0 ? (collected / total) * 100 : 0;
        const isFullyCollected = total > 0 && collected >= total;
        const isHighCollection = total > 0 && percentage >= 80;

        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">
                {percentage.toFixed(1)}% ({isFullyCollected ? t('fullyCollected') : t('notFullyCollected')})
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  background: isFullyCollected
                    ? 'linear-gradient(to right, #10b981, #059669)'
                    : isHighCollection
                      ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                      : 'linear-gradient(to right, #f59e0b, #d97706)',
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-green-600 dark:text-green-400">{formatCurrency(collected)}</span>
              <span className="text-slate-500 dark:text-slate-400">/ {formatCurrency(total)}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'revenue',
      header: ({ column }) => (
        <div className="flex items-center justify-end gap-2">
          <SortableHeader column={column}>
            <DollarSign className="size-4" />
            {t('revenue')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        const revenue = row.original.revenue || 0;
        return (
          <div className="text-right">
            <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(revenue)}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.revenue - rowB.original.revenue;
      },
    },
  ];

  if (showActions) {
    columns.push({
      id: 'actions',
      header: () => <div className="text-center">{t('actions')}</div>,
      cell: ({ row }) => {
        const classItem = row.original;
        return (
          <div className="text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href={`/${locale}/classroom-management/${classItem.id}`} className="flex items-center">
                    <Eye className="size-4 mr-2" />
                    {t('viewDetail')}
                  </Link>
                </DropdownMenuItem>
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(classItem)} className="cursor-pointer">
                    <Edit className="size-4 mr-2" />
                    {t('edit')}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => {
                      if (confirm(t('confirmDelete'))) {
                        onDelete(classItem.id);
                      }
                    }}
                    className="cursor-pointer text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="size-4 mr-2 text-red-600" />
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
              <span className="hidden sm:inline">{t('addClass')}</span>
              <span className="sm:hidden">{t('addClassShort')}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noClassesFound')}</p>
          </div>
        ) : (
          <DataTable columns={columns} data={classes} />
        )}
      </CardContent>
    </Card>
  );
}
