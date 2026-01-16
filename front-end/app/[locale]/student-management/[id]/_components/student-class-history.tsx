'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, LogOut, Tag, MoreHorizontal, ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatDate } from '@/utils/helper';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';

export interface ClassHistoryItem {
  id: string | number;
  className: string;
  classId: string;
  joinedAt: string;
  leftAt?: string;
  status: 'studying' | 'completed' | 'transferred' | 'changing' | 'dropped';
  reason?: string;
}

interface StudentClassHistoryProps {
  classHistory: ClassHistoryItem[];
}

export function StudentClassHistory({ classHistory }: StudentClassHistoryProps) {
  const t = useTranslations('student-detail');
  const locale = useLocale();

  const getStatusBadge = (status: string) => {
    // Convert backend status to frontend status
    const statusMap: Record<string, string> = {
      'STUDYING': 'studying',
      'COMPLETED': 'completed',
      'CHANGING': 'transferred',
      'DROPPED': 'dropped',
    };
    const normalizedStatus = statusMap[status] || status.toLowerCase();

    const variants: Record<string, { label: string; className: string }> = {
      studying: {
        label: t('statusStudying'),
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      completed: {
        label: t('statusCompleted') || 'Hoàn thành',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      transferred: {
        label: t('statusTransferred') || 'Chuyển lớp',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
      changing: {
        label: t('statusTransferred') || 'Chuyển lớp',
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
      dropped: {
        label: t('statusDropped') || 'Bỏ học',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
    };
    const variant = variants[normalizedStatus] || variants.studying;
    return (
      <Badge className={variant.className} variant="outline">
        {variant.label}
      </Badge>
    );
  };

  const columns: ColumnDef<ClassHistoryItem>[] = [
    {
      accessorKey: 'className',
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
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {row.original.className}
          </div>
        );
      },
    },
    {
      accessorKey: 'joinedAt',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            {t('joinedDate')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-slate-500" />
            <span className="text-sm">{formatDate(row.original.joinedAt)}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.joinedAt).getTime();
        const dateB = new Date(rowB.original.joinedAt).getTime();
        return dateA - dateB;
      },
    },
    {
      accessorKey: 'leftAt',
      header: () => (
        <div className="flex items-center gap-2">
          <LogOut className="size-4" />
          {t('leftDate')}
        </div>
      ),
      cell: ({ row }) => {
        const leftAt = row.original.leftAt;
        if (leftAt) {
          return (
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-slate-500" />
              <span className="text-sm">{formatDate(leftAt)}</span>
            </div>
          );
        }
        return <span className="text-sm text-slate-400">-</span>;
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.leftAt ? new Date(rowA.original.leftAt).getTime() : 0;
        const dateB = rowB.original.leftAt ? new Date(rowB.original.leftAt).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <Tag className="size-4" />
            {t('status')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return getStatusBadge(row.original.status);
      },
    },
    {
      id: 'actions',
      header: () => (
        <div className="flex items-center gap-2">
          <MoreHorizontal className="size-4" />
          {t('actions')}
        </div>
      ),
      cell: ({ row }) => {
        const classId = row.original.classId;
        if (!classId) return null;
        return (
          <Link href={`/${locale}/classroom-management/${classId}`}>
            <Badge variant="outline" className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800">
              {t('viewClass')}
              <ExternalLink className="size-3 ml-1 opacity-70" />
            </Badge>
          </Link>
        );
      },
    },
  ];

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-5 text-purple-600 dark:text-purple-400" />
          {t('classHistory')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {classHistory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noClassHistory')}</p>
          </div>
        ) : (
          <DataTable columns={columns} data={classHistory} />
        )}
      </CardContent>
    </Card>
  );
}
