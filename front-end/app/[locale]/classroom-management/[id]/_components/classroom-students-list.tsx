'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { StudentType } from '@/types';
import { formatDate } from '@/utils/helper';
import { Calendar, Mail, Phone, User2, UserCircle, Users, UsersRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ColumnDef } from '@tanstack/react-table';

interface ClassroomStudentsListProps {
  students: StudentType[];
}

export function ClassroomStudentsList({ students }: ClassroomStudentsListProps) {
  const t = useTranslations('classroom-detail');

  const getGenderBadge = (gender: string) => {
    const variants: Record<string, string> = {
      MALE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      FEMALE: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
    };
    return variants[gender] || variants.other;
  };

  const columns: ColumnDef<StudentType>[] = [
    {
      accessorKey: 'fullName',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <User2 className="size-4" />
            {t('studentName')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-medium text-slate-900 dark:text-slate-100">{row.original.fullName}</div>
        );
      },
    },
    {
      accessorKey: 'fullNameParent',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <UserCircle className="size-4" />
            {t('parentName')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return <div className="text-slate-700 dark:text-slate-300">{row.original.fullNameParent}</div>;
      },
    },
    {
      id: 'studentContact',
      header: () => (
        <div className="flex items-center gap-2">
          <Phone className="size-4" />
          {t('studentContact')}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Phone className="size-3.5 text-slate-500" />
              <span>{row.original.phoneNumber}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Mail className="size-3.5 text-slate-500" />
              <span>{row.original.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: 'parentContact',
      header: () => (
        <div className="flex items-center gap-2">
          <Phone className="size-4" />
          {t('parentContact')}
        </div>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <Phone className="size-3.5 text-slate-500" />
            <span>{row.original.phoneNumberParent}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'gender',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <UsersRound className="size-4" />
            {t('gender')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="text-center">
            <Badge className={getGenderBadge(row.original.gender)}>
              {row.original.gender === 'MALE' ? 'Nam' : 'Nữ'}
            </Badge>
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
  ];

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Users className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
          {t('studentsList')}
          <span className="text-sm md:text-base font-normal text-slate-500 dark:text-slate-400">
            ({students.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">Chưa có học viên nào trong lớp</p>
          </div>
        ) : (
          <DataTable columns={columns} data={students} />
        )}
      </CardContent>
    </Card>
  );
}
