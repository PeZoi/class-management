import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/helper';
import { BookOpen, Calendar, DollarSign, ExternalLink, Users, Clock, Loader2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ClassType, ClassShiftType } from '@/types/class-type';
import { classShiftService } from '@/services';
import { useEffect, useState } from 'react';

interface TeacherClassesListProps {
  classes: ClassType[];
}

export function TeacherClassesList({ classes }: TeacherClassesListProps) {
  const t = useTranslations('teacher-detail');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const [shiftsByClassId, setShiftsByClassId] = useState<Record<string, ClassShiftType[]>>({});
  const [loadingShifts, setLoadingShifts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchShiftsForAllClasses = async () => {
      if (classes.length === 0) return;

      // Set loading state for all classes
      const initialLoadingState: Record<string, boolean> = {};
      classes.forEach((classItem) => {
        initialLoadingState[classItem.id] = true;
      });
      setLoadingShifts(initialLoadingState);

      // Fetch shifts for all classes in parallel
      const shiftPromises = classes.map(async (classItem) => {
        try {
          const response = await classShiftService.getByClassId(classItem.id);
          if (response.status === 200 && response.data) {
            return { classId: classItem.id, shifts: response.data };
          }
          return { classId: classItem.id, shifts: [] };
        } catch (error) {
          console.error(`Error fetching shifts for class ${classItem.id}:`, error);
          return { classId: classItem.id, shifts: [] };
        }
      });

      const results = await Promise.all(shiftPromises);
      
      // Update shifts state
      const newShiftsByClassId: Record<string, ClassShiftType[]> = {};
      results.forEach(({ classId, shifts }) => {
        newShiftsByClassId[classId] = shifts;
      });
      setShiftsByClassId(newShiftsByClassId);

      // Clear loading state
      setLoadingShifts({});
    };

    fetchShiftsForAllClasses();
  }, [classes]);

  if (classes.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <BookOpen className="size-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t('noClasses')}
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
          {t('classesList')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('className')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="size-4" />
                    <span>{t('schedule')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Users className="size-4" />
                    <span>{t('students')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="size-4" />
                    <span>{t('monthlyFee')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="size-4" />
                    <span>{t('revenue')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {t('actions')}
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
                  <TableCell className="text-center">
                    {loadingShifts[classItem.id] ? (
                      <div className="flex items-center justify-center gap-2 py-2">
                        <Loader2 className="size-4 animate-spin text-slate-400" />
                        <span className="text-xs text-slate-500">{tCommon('loadingShifts')}</span>
                      </div>
                    ) : shiftsByClassId[classItem.id]?.length > 0 ? (
                      <div className="flex flex-col items-center gap-1.5 py-1">
                        {shiftsByClassId[classItem.id].map((shift) => (
                          <Badge
                            key={shift.id}
                            variant="outline"
                            className="text-xs font-medium px-2 py-0.5 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30"
                          >
                            <Clock className="size-3 mr-1" />
                            {shift.name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400 italic">
                        {tCommon('noShift')}
                      </span>
                    )}
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
                      <span>{t('view')}</span>
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
