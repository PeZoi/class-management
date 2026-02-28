'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { TeacherType } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helper';
import { ColumnDef } from '@tanstack/react-table';
import {
  BookOpen,
  Calendar,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileX,
  Key,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  Trash2,
  User,
  CheckCircle2,
  XCircle,
  Ban,
  RotateCcw,
  ClipboardCheck,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

interface TeacherTableProps {
  teachers: TeacherType[];
  onEdit?: (teacher: TeacherType) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
  onViewDetail?: (teacher: TeacherType) => void;
  onResetPassword?: (teacher: TeacherType) => void;
  onRestore?: (id: string) => void;
  onAssignClasses?: (teacher: TeacherType) => void;
  title?: string;
  description?: string;
  showActions?: boolean;
  className?: string;
  pageIndex?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isLoading?: boolean;
  error?: string;
}

export function TeacherTable({
  teachers,
  onEdit,
  onDelete,
  onAdd,
  onViewDetail,
  onResetPassword,
  onRestore,
  onAssignClasses,
  title,
  description,
  showActions = true,
  className,
  pageIndex,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isLoading,
  error,
}: TeacherTableProps) {
  const t = useTranslations('teacher-management');
  const locale = useLocale();

  const displayTitle = title || t('title');
  const displayDescription = description || t('description');

  const columns: ColumnDef<TeacherType>[] = [
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <User className="size-4" />
            {t('teacherName')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-slate-900 dark:text-slate-100">
            <div className="space-y-0.5">
              <Link
                href={`/${locale}/teacher-management/${row.original.id}`}
                className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {row.original.fullName}
              </Link>
              <div className="text-xs text-slate-500">
                {row.original.gender === 'MALE'
                  ? t('male')
                  : row.original.gender === 'FEMALE'
                    ? t('female')
                    : t('other')}
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
      id: 'salary',
      header: () => (
        <div className="flex items-center gap-2">
          <DollarSign className="size-4" />
          {t('salary')}
        </div>
      ),
      cell: () => {
        return (
          <div className="flex items-center">
            <div className="text-right">
              <div className="text-base font-bold text-green-600 dark:text-green-400">{formatCurrency(9999999)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('perMonth')}</div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'totalClasses',
      accessorFn: (row) => row.classList?.length || 0,
      header: ({ column }) => (
        <div className="flex items-center justify-center gap-2">
          <SortableHeader column={column} className="justify-center">
            <BookOpen className="size-4" />
            {t('totalClasses')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <Badge variant="outline" className="font-semibold">
              {row.original?.classList?.length || 0}
            </Badge>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const countA = rowA.original.classList?.length || 0;
        const countB = rowB.original.classList?.length || 0;
        return countA - countB;
      },
    },
    {
      accessorKey: 'dob',
      header: ({ column }) => (
        <div className="flex items-center justify-center gap-2">
          <SortableHeader column={column} className="justify-center">
            <Calendar className="size-4" />
            {t('dob')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center text-slate-600 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
            <Calendar className="size-4 opacity-80" />
            {formatDate(row.original.dob.toString())}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.dob.toString()).getTime();
        const dateB = new Date(rowB.original.dob.toString()).getTime();
        return dateA - dateB;
      },
    },
    {
      accessorKey: 'idCard',
      header: ({ column }) => (
        <div className="flex items-center justify-center gap-2">
          <SortableHeader column={column} className="justify-center">
            <CreditCard className="size-4" />
            {t('idCard')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <span className="font-mono text-sm text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded">
              {row.original.idCard}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <div className="flex items-center justify-center gap-2">
          <SortableHeader column={column} className="justify-center">
            <CheckCircle2 className="size-4" />
            {t('status')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const getStatusConfig = () => {
          switch (status) {
            case 'ACTIVE':
              return {
                label: t('statusActive'),
                className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                icon: CheckCircle2,
              };
            case 'DELETED':
              return {
                label: t('statusDeleted'),
                className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                icon: XCircle,
              };
            case 'BLOCKED':
              return {
                label: t('statusBlocked'),
                className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
                icon: Ban,
              };
            default:
              return {
                label: status || t('statusActive'),
                className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                icon: CheckCircle2,
              };
          }
        };

        const config = getStatusConfig();
        const Icon = config.icon;

        return (
          <div className="text-center">
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.className)}>
              <Icon className="size-3" />
              {config.label}
            </span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const statusA = rowA.original.status || 'ACTIVE';
        const statusB = rowB.original.status || 'ACTIVE';
        return statusA.localeCompare(statusB);
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <div className="flex items-center justify-center gap-2">
          <SortableHeader column={column} className="justify-center">
            <Calendar className="size-4" />
            {t('joinedDate')}
          </SortableHeader>
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center text-slate-600 dark:text-slate-400 text-sm flex items-center justify-center gap-2">
            <Calendar className="size-4 opacity-80" />
            {formatDate(row.original.createdAt.toString())}
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.createdAt.toString()).getTime();
        const dateB = new Date(rowB.original.createdAt.toString()).getTime();
        return dateA - dateB;
      },
    },
  ];

  if (showActions) {
    columns.push({
      id: 'actions',
      header: () => <div className="text-center">{t('actions')}</div>,
      cell: ({ row }) => {
        const teacher = row.original;
        const isDeleted = teacher.status === 'DELETED';
        
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
                {onViewDetail && (
                  <DropdownMenuItem className="cursor-pointer" onClick={() => onViewDetail(teacher)}>
                    <Eye className="size-4 mr-2" />
                    {t('viewDetail')}
                  </DropdownMenuItem>
                )}
                {!isDeleted && (
                  <>
                    {onEdit && (
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(teacher)}>
                        <Edit className="size-4 mr-2" />
                        {t('edit')}
                      </DropdownMenuItem>
                    )}
                    {onAssignClasses && (
                      <DropdownMenuItem className="cursor-pointer" onClick={() => onAssignClasses(teacher)}>
                        <ClipboardCheck className="size-4 mr-2" />
                        {t('assignClasses')}
                      </DropdownMenuItem>
                    )}
                    {onResetPassword && (
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => {
                          if (window.confirm(t('confirmResetPassword'))) {
                            onResetPassword(teacher);
                          }
                        }}
                      >
                        <Key className="size-4 mr-2" />
                        {t('resetPassword')}
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 dark:text-red-400"
                        onClick={() => {
                          if (window.confirm(t('confirmDelete'))) {
                            onDelete(teacher.id);
                          }
                        }}
                      >
                        <Trash2 className="size-4 mr-2" />
                        {t('delete')}
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {isDeleted && onRestore && (
                  <DropdownMenuItem
                    className="cursor-pointer text-emerald-600 dark:text-emerald-400"
                    onClick={() => {
                      if (window.confirm(t('confirmRestore'))) {
                        onRestore(teacher.id);
                      }
                    }}
                  >
                    <RotateCcw className="size-4 mr-2" />
                    {t('restore')}
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
              <span className="hidden sm:inline">{t('addTeacher')}</span>
              <span className="sm:hidden">{t('addTeacherShort')}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="size-4 animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('loading')}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-8">
            <FileX className="size-8 text-slate-400 dark:text-slate-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noTeachersFound')}</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={teachers}
            pageSize={pageSize}
            manualPagination={typeof pageIndex === 'number' && typeof totalItems === 'number'}
            pageIndex={pageIndex}
            totalItems={totalItems}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
