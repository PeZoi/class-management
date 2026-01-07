import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StudentType } from '@/types/student-type';

interface StudentParentInfoProps {
  student: StudentType;
}

export function StudentParentInfo({ student }: StudentParentInfoProps) {
  const t = useTranslations('student-detail');

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5 text-purple-600 dark:text-purple-400" />
          {t('parentInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('parentName')}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {student.fullNameParent || t('noData')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-4 text-slate-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('parentPhone')}: </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {student.phoneNumberParent || t('noData')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
