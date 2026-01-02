import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/helper';
import { BookOpen, Calendar, DollarSign, ExternalLink, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ClassType } from '@/types/class-type';

interface TeacherClassesListProps {
  classes: ClassType[];
}

export function TeacherClassesList({ classes }: TeacherClassesListProps) {
  const t = useTranslations('teacher-detail');
  const locale = useLocale();

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="size-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t('noClasses') || 'Chưa có lớp học nào'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-5" />
          {t('classesList') || 'Danh sách lớp học'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('className') || 'Tên lớp'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="size-4" />
                    <span>{t('schedule') || 'Lịch học'}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="size-4" />
                    <span>{t('students') || 'Học sinh'}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="size-4" />
                    <span>{t('monthlyFee') || 'Học phí'}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="size-4" />
                    <span>{t('revenue') || 'Doanh thu'}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {t('actions') || 'Thao tác'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow
                  key={classItem.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-blue-500" />
                      {classItem.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-slate-600 dark:text-slate-400 text-sm">
                    {classItem.schedule}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-semibold">
                      {classItem.studentCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(classItem.monthlyFee)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(classItem.revenue)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Link
                      href={`/${locale}/classroom-management/${classItem.id}`}
                      className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      <span>{t('view') || 'Xem'}</span>
                      <ExternalLink className="size-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
