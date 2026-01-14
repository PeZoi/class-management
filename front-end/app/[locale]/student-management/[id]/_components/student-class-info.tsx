import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StudentType } from '@/types/student-type';
import { formatDate } from '@/utils/helper';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';

interface StudentClassInfoProps {
  student: StudentType;
}

export function StudentClassInfo({ student }: StudentClassInfoProps) {
  const t = useTranslations('student-detail');
  const locale = useLocale();

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="size-5 text-green-600 dark:text-green-400" />
          {t('classInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {student.class ? (
          <>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{t('className')}</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{student.class.name}</p>
            </div>
            {student.class.shiftName && (
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-slate-500" />
                <span className="text-sm text-slate-500 dark:text-slate-400">Ca học:</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {student.class.shiftName}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-slate-500" />
              <span className="text-sm text-slate-500 dark:text-slate-400">{t('joinedDate')}: </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {student.class.joinAt ? formatDate(student.class.joinAt) : t('noData')}
              </span>
            </div>
            {student.class.id && (
              <Link href={`/${locale}/classroom-management/${student.class.id}`}>
                <Button variant="outline" size="sm" className="mt-2">
                  {t('viewClass')}
                </Button>
              </Link>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noClass')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
