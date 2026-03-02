import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts';

interface AttendanceByShiftChartProps {
  data: Array<{ shiftName: string; present: number; absent: number; late: number; excused: number }>;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  present: '#22c55e',
  absent: '#ef4444',
  late: '#f97316',
  excused: '#3b82f6',
};

export function AttendanceByShiftChart({ data, isLoading = false }: AttendanceByShiftChartProps) {
  const t = useTranslations('classroom-detail');
  const tAttendance = useTranslations('attendance');

  const hasData = data.some(
    (item) => item.present + item.absent + item.late + item.excused > 0,
  );

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {tAttendance('shift') || 'Shift'}
        </p>
        <CardTitle
          className="text-lg md:text-xl font-bold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(to right, #4f46e5, #06b6d4)' }}
        >
          {t('attendanceByShiftChart')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[260px]">
            <Loader2 className="size-10 animate-spin text-slate-400" />
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-[260px] text-slate-500">
            {t('noData')}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((shift) => {
              const total =
                shift.present + shift.absent + shift.late + shift.excused;

              if (total === 0) return null;

              const pieData = [
                {
                  name: tAttendance('status.present'),
                  key: 'present',
                  value: shift.present,
                },
                {
                  name: tAttendance('status.absent'),
                  key: 'absent',
                  value: shift.absent,
                },
                {
                  name: tAttendance('status.late'),
                  key: 'late',
                  value: shift.late,
                },
                {
                  name: tAttendance('status.excused'),
                  key: 'excused',
                  value: shift.excused,
                },
              ].filter((item) => item.value > 0);

              return (
                <div
                  key={shift.shiftName}
                  className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-4 shadow-sm"
                >
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 text-center">
                    {shift.shiftName}
                  </div>
                  <ChartContainer
                    config={{
                      present: { label: tAttendance('status.present'), color: STATUS_COLORS.present },
                      absent: { label: tAttendance('status.absent'), color: STATUS_COLORS.absent },
                      late: { label: tAttendance('status.late'), color: STATUS_COLORS.late },
                      excused: { label: tAttendance('status.excused'), color: STATUS_COLORS.excused },
                    }}
                    className="h-[260px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={3}
                          labelLine={false}
                          label={({ name, value }) =>
                            `${name}: ${((value as number / total) * 100).toFixed(0)}%`
                          }
                          dataKey="value"
                          animationDuration={800}
                        >
                          {pieData.map((entry) => (
                            <Cell
                              key={entry.key}
                              fill={STATUS_COLORS[entry.key] || '#64748b'}
                            />
                          ))}
                        </Pie>
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              className="bg-slate-900 dark:bg-slate-800 text-white border-slate-700"
                              formatter={(value, name) => {
                                const percent =
                                  total > 0
                                    ? ((value as number / total) * 100).toFixed(1)
                                    : '0.0';
                                return [
                                  <div key={name as string} className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-300 text-xs">
                                        {name}:
                                      </span>
                                      <span className="font-bold text-white">
                                        {value}
                                      </span>
                                    </div>
                                    <div className="text-xs text-slate-400">
                                      {Number(percent).toFixed(0) || '0'}%
                                    </div>
                                  </div>,
                                ];
                              }}
                            />
                          }
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={32}
                          formatter={(value) => value as string}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

