import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from 'recharts';

interface AttendanceStatusChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  isLoading?: boolean;
}

const COLORS = ['#22c55e', '#f97316', '#6366f1', '#f97373']; // Emerald, Orange, Indigo, Soft Red

export function AttendanceStatusChart({ data, isLoading = false }: AttendanceStatusChartProps) {
  const t = useTranslations('classroom-detail');
  const tAttendance = useTranslations('attendance');

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {tAttendance('summary') || 'Summary'}
        </p>
        <CardTitle
          className="text-lg md:text-xl font-bold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(to right, #4f46e5, #06b6d4)' }}
        >
          {t('attendanceStatusChart')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            present: { label: tAttendance('status.present'), color: '#10b981' },
            absent: { label: tAttendance('status.absent'), color: '#ef4444' },
            late: { label: tAttendance('status.late'), color: '#f59e0b' },
            excused: { label: tAttendance('status.excused'), color: '#3b82f6' },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-10 animate-spin text-slate-400" />
              </div>
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500">
                {t('noData')}
              </div>
            ) : (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  fill="#8884d8"
                  dataKey="value"
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-slate-900 dark:bg-slate-800 text-white border-slate-700"
                      formatter={(value, name) => {
                        const count = value as number;
                        const label = String(name);
                        const percent =
                          total > 0 ? ((count / total) * 100).toFixed(0) : '0';

                        return [
                          <div key={label} className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 text-xs">
                                {label}:
                              </span>
                              <span className="font-bold text-white">
                                {count}
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
                  height={36}
                  formatter={(value) => {
                    const item = data.find((d) => d.name === value);
                    return item?.name || value;
                  }}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

