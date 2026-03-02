import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts';

interface AttendanceRateChartProps {
  data: Array<{ month: string; label: string; rate: number }>;
  isLoading?: boolean;
}

export function AttendanceRateChart({ data, isLoading = false }: AttendanceRateChartProps) {
  const t = useTranslations('classroom-detail');

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle
          className="text-xl md:text-2xl font-bold text-transparent bg-clip-text"
          style={{ backgroundImage: 'linear-gradient(to right, #22c55e, #0ea5e9)' }}
        >
          {t('attendanceRateChart')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            rate: {
              label: t('attendanceRate'),
              color: '#22c55e',
            },
          }}
          className="h-[320px] w-full"
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
              <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="attendanceRateGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-slate-200 dark:stroke-slate-800"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-600 dark:text-slate-400"
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-600 dark:text-slate-400"
                  tick={{ fontSize: 11 }}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-slate-900 dark:bg-slate-800 text-white border-slate-700"
                      labelFormatter={(label) => {
                        const item = data.find((d) => d.month === label);
                        return item?.label || label;
                      }}
                      formatter={(value) => {
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 text-xs">{t('attendanceRate')}:</span>
                            <span className="font-bold text-white">{Number(value).toFixed(1)}%</span>
                          </div>
                        );
                      }}
                    />
                  }
                  cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  fill="url(#attendanceRateGradient)"
                  activeDot={{ r: 5, strokeWidth: 2, stroke: '#0ea5e9' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

