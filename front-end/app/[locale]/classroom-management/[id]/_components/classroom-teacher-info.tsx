import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ClassroomTeacherInfoProps {
  teacher: string;
  teacherEmail: string;
  teacherPhone: string;
}

export function ClassroomTeacherInfo({ teacher, teacherEmail, teacherPhone }: ClassroomTeacherInfoProps) {
  const t = useTranslations('classroom-detail');

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5 text-blue-600 dark:text-blue-400" />
          {t('teacherInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('name')}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{teacher}</p>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-slate-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">{teacherEmail}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-4 text-slate-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">{teacherPhone}</span>
        </div>
      </CardContent>
    </Card>
  );
}
