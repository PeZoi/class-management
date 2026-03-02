import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';

interface AttendanceByStudentChartProps {
  data: Array<{
    studentName: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    rate: number;
  }>;
  isLoading?: boolean;
}

export function AttendanceByStudentChart({ data, isLoading = false }: AttendanceByStudentChartProps) {
  const t = useTranslations('classroom-detail');
  const tAttendance = useTranslations('attendance');

  // Sort by absent count descending (students with worst attendance first), limit to top 10
  const sortedData = [...data]
    .sort((a, b) => b.absentCount - a.absentCount || a.studentName.localeCompare(b.studentName))
    .slice(0, 10);

  const getBadgeVariant = (rate: number) => {
    if (rate >= 80) return 'success';
    if (rate >= 60) return 'warning';
    return 'destructive';
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle
          className="text-xl md:text-2xl font-bold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }}
        >
          {t('attendanceByStudentChart')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[260px]">
            <Loader2 className="size-10 animate-spin text-slate-400" />
          </div>
        ) : sortedData.length === 0 ? (
          <div className="flex items-center justify-center h-[260px] text-slate-500">
            {t('noData')}
          </div>
        ) : (
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {sortedData.map((item, index) => {
              const rate = Math.max(0, Math.min(100, item.rate));
              const badgeVariant = getBadgeVariant(rate);

              return (
                <div
                  key={item.studentName}
                  className="space-y-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-semibold text-slate-400 shrink-0">
                        #{index + 1}
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.studentName}
                      </span>
                    </div>
                    <Badge variant={badgeVariant as any} className="text-xs px-2 py-0.5">
                      {rate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                    <span>
                      {tAttendance('status.present')}: {item.presentCount}/{item.totalSessions}
                    </span>
                    <span>
                      {tAttendance('status.absent')}: {item.absentCount}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

