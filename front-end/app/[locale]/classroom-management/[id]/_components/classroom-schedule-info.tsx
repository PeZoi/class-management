import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useClassShiftsByClass } from '@/hooks/use-classes';

interface ClassroomScheduleInfoProps {
  classId: string;
}

export function ClassroomScheduleInfo({ classId }: ClassroomScheduleInfoProps) {
  const t = useTranslations('classroom-detail');
  const tCommon = useTranslations('common');
  const { data: shifts = [], isLoading: loading } = useClassShiftsByClass(classId);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5 text-purple-600 dark:text-purple-400" />
          {t('schedule')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="size-6 animate-spin text-purple-500" />
              <p className="text-sm text-slate-500 dark:text-slate-400">{tCommon('loadingShifts')}</p>
            </div>
          </div>
        ) : shifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3 mb-3">
              <Clock className="size-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{tCommon('noShift')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{tCommon('noShiftsForClass')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {shifts.map((shift, index) => (
              <div
                key={shift.id}
                className="group relative flex items-center gap-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 p-3 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200"
              >
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-purple-500 group-hover:bg-purple-600 transition-colors" />
                
                {/* Number badge */}
                <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold text-sm group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  {index + 1}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                      {shift.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
