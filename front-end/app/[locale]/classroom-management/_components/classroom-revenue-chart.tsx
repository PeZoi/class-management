'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend, ResponsiveContainer } from 'recharts';

type TimePeriod = '3months' | '6months' | '12months';

interface ClassroomRevenueChartProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  revenueData: Array<{
    month: string;
    label: string;
    [key: string]: string | number;
  }>;
  formatCurrency: (amount: number) => string;
  classNames: Array<{ id: number; name: string; color: string }>;
  className?: string;
}

export function ClassroomRevenueChart({
  selectedPeriod,
  onPeriodChange,
  revenueData,
  formatCurrency,
  classNames,
  className,
}: ClassroomRevenueChartProps) {
  const t = useTranslations('classroom-management');

  // Custom legend
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {payload?.map((entry: { value: string; color?: string }, index: number) => {
          // Map dataKey (class_1, class_2, ...) to actual class name
          const classId = entry.value.replace('class_', '');
          const className = classNames.find((c) => c.id.toString() === classId);

          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
                {className?.name || entry.value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg',
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="min-w-0">
            <CardTitle
              className="text-xl md:text-2xl font-bold text-transparent bg-clip-text truncate"
              style={{ backgroundImage: 'linear-gradient(to right, #2563eb, #9333ea)' }}
            >
              {t('revenueChart')}
            </CardTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('compareAllClasses')} - {t(`period_${selectedPeriod}`)}
            </p>
          </div>

          {/* Time period buttons */}
          <div className="flex gap-1 md:gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg shrink-0">
            <Button
              variant={selectedPeriod === '3months' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange('3months')}
              className="text-xs"
            >
              3M
            </Button>
            <Button
              variant={selectedPeriod === '6months' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange('6months')}
              className="text-xs"
            >
              6M
            </Button>
            <Button
              variant={selectedPeriod === '12months' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onPeriodChange('12months')}
              className="text-xs"
            >
              12M
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ChartContainer
          config={classNames.reduce(
            (acc, cls) => ({
              ...acc,
              [`class_${cls.id}`]: {
                label: cls.name,
                color: cls.color,
              },
            }),
            {},
          )}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
                tick={{ fontSize: 12, fontWeight: 600 }}
                height={50}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                className="text-slate-600 dark:text-slate-400"
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => {
                  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                  return value.toString();
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-slate-900 dark:bg-slate-800 text-white border-slate-700 min-w-[200px]"
                    labelFormatter={(label) => {
                      const item = revenueData.find((d) => d.month === label);
                      return item?.label || label;
                    }}
                    formatter={(value, name) => {
                      const classItem = classNames.find((c) => `class_${c.id}` === name);
                      return (
                        <div className="flex items-center justify-between gap-4 w-full">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: classItem?.color }}
                            />
                            <span className="text-slate-300 text-xs">{classItem?.name}:</span>
                          </div>
                          <span className="font-bold text-white">{formatCurrency(Number(value))}</span>
                        </div>
                      );
                    }}
                  />
                }
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Legend content={renderLegend} />

              {/* Render lines for each class */}
              {classNames.map((cls) => (
                <Line
                  key={cls.id}
                  type="monotone"
                  dataKey={`class_${cls.id}`}
                  stroke={cls.color}
                  strokeWidth={3}
                  dot={{
                    fill: cls.color,
                    strokeWidth: 2,
                    r: 4,
                    stroke: '#fff',
                  }}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    stroke: '#fff',
                  }}
                  animationDuration={800}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
