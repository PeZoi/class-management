import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Legend } from 'recharts';

interface AttendanceStatusByShiftChartProps {
  data: Array<{
    shiftName: string;
    students: Array<{
      studentName: string;
      presentRate: number;
      absentRate: number;
      lateRate: number;
      excusedRate: number;
    }>;
  }>;
  isLoading?: boolean;
}

export function AttendanceStatusByShiftChart({
  data,
  isLoading = false,
}: AttendanceStatusByShiftChartProps) {
  const tDetail = useTranslations('classroom-detail');
  const tAttendance = useTranslations('attendance');

  const hasData = data.some((shift) =>
    shift.students.some(
      (s) =>
        s.presentRate > 0 ||
        s.absentRate > 0 ||
        s.lateRate > 0 ||
        s.excusedRate > 0,
    ),
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
          {tDetail('attendanceStatusChart')} ({tDetail('attendanceByShiftChart')})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-[320px]">
            <Loader2 className="size-10 animate-spin text-slate-400" />
          </div>
        ) : !hasData ? (
          <div className="flex items-center justify-center h-[320px] text-slate-500">
            {tDetail('noData')}
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((shift) => {
              if (shift.students.length === 0) return null;

              return (
                <div
                  key={shift.shiftName}
                  className="space-y-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 p-4 shadow-sm"
                >
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {shift.shiftName}
                  </div>
                  <ChartContainer
                    config={{
                      presentRate: { label: tAttendance('status.present'), color: '#22c55e' },
                      absentRate: { label: tAttendance('status.absent'), color: '#ef4444' },
                      lateRate: { label: tAttendance('status.late'), color: '#f97316' },
                      excusedRate: { label: tAttendance('status.excused'), color: '#3b82f6' },
                    }}
                    className="h-[260px] w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={shift.students}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-slate-200 dark:stroke-slate-800"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="studentName"
                          tickLine={false}
                          axisLine={false}
                          className="text-slate-600 dark:text-slate-400"
                          tick={{ fontSize: 11 }}
                          interval={0}
                          angle={-30}
                          textAnchor="end"
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          className="text-slate-600 dark:text-slate-400"
                          tick={{ fontSize: 11 }}
                          domain={[0, 100]}
                          tickFormatter={(value) => `${value?.toFixed(0)}%`}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              className="bg-slate-900 dark:bg-slate-800 text-white border-slate-700"
                              formatter={(value, name) => {
                                const labelMap: Record<string, string> = {
                                  presentRate: tAttendance('status.present'),
                                  absentRate: tAttendance('status.absent'),
                                  lateRate: tAttendance('status.late'),
                                  excusedRate: tAttendance('status.excused'),
                                };
                                const label = labelMap[name as string] ?? (name as string);
                                const rate = Number(value ?? 0);
                                return [
                                  <div key={label} className="flex items-center gap-2">
                                    <span className="text-slate-300 text-xs">{label}:</span>
                                    <span className="font-bold text-white">
                                      {rate.toFixed(0)}%
                                    </span>
                                  </div>,
                                ];
                              }}
                            />
                          }
                        />
                        <Legend
                          formatter={(value) => {
                            const labelMap: Record<string, string> = {
                              presentRate: tAttendance('status.present'),
                              absentRate: tAttendance('status.absent'),
                              lateRate: tAttendance('status.late'),
                              excusedRate: tAttendance('status.excused'),
                            };
                            return labelMap[value as string] ?? (value as string);
                          }}
                        />
                        <Bar dataKey="presentRate" stackId="a" fill="#22c55e" />
                        <Bar dataKey="absentRate" stackId="a" fill="#ef4444" />
                        <Bar dataKey="lateRate" stackId="a" fill="#f97316" />
                        <Bar dataKey="excusedRate" stackId="a" fill="#3b82f6" />
                      </BarChart>
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


