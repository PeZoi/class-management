import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { queryKeys } from '@/lib/queryKeys';
import { classShiftService } from '@/services';
import { ClassShiftType, ClassType } from '@/types/class-type';
import { formatCurrency } from '@/utils/helper';
import { useQueries } from '@tanstack/react-query';
import { BookOpen, Calendar, DollarSign, ExternalLink, Eye, Loader2, Users, Wallet } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';

interface TeacherClassesListProps {
  classes: ClassType[];
}

export function TeacherClassesList({ classes }: TeacherClassesListProps) {
  const t = useTranslations('teacher-detail');
  const tCommon = useTranslations('common');
  const tClassroom = useTranslations('classroom-management');
  const locale = useLocale();

  // Chỉ fetch shifts cho các class chưa có classShifts
  const classesNeedingShifts = useMemo(() => {
    return classes.filter((c) => !c.classShifts || c.classShifts.length === 0);
  }, [classes]);

  const shiftQueries = useQueries({
    queries: classesNeedingShifts.map((classItem) => ({
      queryKey: queryKeys.classShifts.byClass(classItem.id),
      queryFn: async () => {
        const response = await classShiftService.getByClassId(classItem.id);
        if (response.status === 200 && response.data) {
          return response.data as ClassShiftType[];
        }
        return [] as ClassShiftType[];
      },
      enabled: !!classItem.id,
    })),
  });

  // Tạo map shifts cho các class đã fetch
  const fetchedShiftsByClassId: Record<string, ClassShiftType[]> = {};
  const loadingShifts: Record<string, boolean> = {};

  classesNeedingShifts.forEach((classItem, index) => {
    const query = shiftQueries[index];
    fetchedShiftsByClassId[classItem.id] = (query.data as ClassShiftType[]) || [];
    loadingShifts[classItem.id] = query.isLoading;
  });

  // Helper function để lấy shifts cho một class
  const getShiftsForClass = (classItem: ClassType): ClassShiftType[] => {
    // Ưu tiên dùng classShifts từ class data
    if (classItem.classShifts && classItem.classShifts.length > 0) {
      return classItem.classShifts;
    }
    // Nếu không có, dùng fetched shifts
    return fetchedShiftsByClassId[classItem.id] || [];
  };

  const isLoadingShifts = (classId: string): boolean => {
    return loadingShifts[classId] || false;
  };

  if (classes.length === 0) {
    return (
      <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg">
        <CardContent className="py-16 text-center">
          <BookOpen className="size-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400 text-base font-medium">
            {t('noClasses')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <BookOpen className="size-6 text-blue-600 dark:text-blue-400" />
              {t('classesList')}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4" />
                    {t('className')}
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="size-4" />
                    <span>{t('schedule')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="size-4" />
                    <span>{t('students')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <Wallet className="size-4" />
                    <span>{t('monthlyFee')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="size-4" />
                    <span>{t('revenue')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center whitespace-nowrap">
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((classItem) => {
                const shifts = getShiftsForClass(classItem);
                const isLoading = isLoadingShifts(classItem.id);

                return (
                  <TableRow
                    key={classItem.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-slate-200 dark:border-slate-700"
                  >
                    <TableCell className="font-medium">
                      <Link
                        href={`/${locale}/classroom-management/${classItem.id}`}
                        className="group flex items-center gap-2.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <div className="size-2.5 rounded-full bg-blue-500 group-hover:bg-blue-600 transition-colors" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {classItem.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2 py-2">
                          <Loader2 className="size-4 animate-spin text-slate-400" />
                          <span className="text-xs text-slate-500 dark:text-slate-400">{tCommon('loadingShifts')}</span>
                        </div>
                      ) : shifts.length > 0 ? (
                        <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          {shifts.map((shift) => (
                            <div className="flex items-center gap-1.5 mx-auto" key={shift.id}>
                              <Calendar className="size-3.5 mt-0.5" />
                              {shift.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400 italic">
                          {tCommon('noShift')}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge 
                        variant="outline" 
                        className="font-semibold text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800"
                      >
                        <Users className="size-3.5 mr-1.5 inline" />
                        {classItem.studentCount || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {formatCurrency(classItem.monthlyFee || 0)}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {tClassroom('perStudent')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(classItem.revenue || 0)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Link
                        href={`/${locale}/classroom-management/${classItem.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-md transition-all"
                      >
                        <Eye className="size-4" />
                        <span>{t('view')}</span>
                        <ExternalLink className="size-3.5" />
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
