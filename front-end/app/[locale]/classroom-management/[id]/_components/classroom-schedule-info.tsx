import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ClassroomScheduleInfoProps {
  schedule: string;
  time: string;
  duration: string;
}

export function ClassroomScheduleInfo({ schedule, time, duration }: ClassroomScheduleInfoProps) {
  const t = useTranslations('classroom-detail');

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5 text-purple-600 dark:text-purple-400" />
          {t('schedule')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('days')}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{schedule}</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-slate-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">{time}</span>
        </div>
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('duration')}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{duration}</p>
        </div>
      </CardContent>
    </Card>
  );
}
