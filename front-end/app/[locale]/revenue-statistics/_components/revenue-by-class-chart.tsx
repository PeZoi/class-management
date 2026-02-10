'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, LabelList } from 'recharts';
import { RevenueByClassResponse } from '@/services/dashboard-service';

type TimePeriod = '3months' | '6months' | '12months';

interface RevenueByClassChartProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  data: RevenueByClassResponse[];
  formatCurrency: (amount: number) => string;
  className?: string;
  isLoading: boolean;
}

export function RevenueByClassChart({
  selectedPeriod,
  onPeriodChange,
  data,
  formatCurrency,
  className,
  isLoading,
}: RevenueByClassChartProps) {
  const t = useTranslations('revenue-statistics');

  // Lấy top 10 lớp có doanh thu cao nhất
  const topClasses = data.slice(0, 10);

  return (
    <Card
      className={cn(
        'hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg',
        className,
      )}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="min-w-0">
            <CardTitle className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
              {t('revenueByClass')}
            </CardTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {selectedPeriod === '3months' && t('last3Months')}
              {selectedPeriod === '6months' && t('last6Months')}
              {selectedPeriod === '12months' && t('last12Months')}
            </p>
          </div>
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
          config={{
            revenue: {
              label: t('revenue'),
              color: 'hsl(var(--chart-1))',
            },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-10 animate-spin" />
              </div>
            ) : topClasses.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                {t('noData')}
              </div>
            ) : (
              <BarChart data={topClasses} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
                <XAxis
                  dataKey="className"
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-600 dark:text-slate-400"
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-600 dark:text-slate-400"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
                    if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toString();
                  }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-slate-900 dark:bg-slate-800 text-white border-slate-700"
                      formatter={(value) => {
                        return (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 text-xs">{t('revenue')}:</span>
                            <span className="font-bold text-white">{formatCurrency(Number(value))}</span>
                          </div>
                        );
                      }}
                    />
                  }
                  cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                />
                <defs>
                  <linearGradient id="colorRevenueByClass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <Bar
                  dataKey="revenue"
                  fill="url(#colorRevenueByClass)"
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                  className="drop-shadow-md"
                >
                  <LabelList
                    dataKey="revenue"
                    position="top"
                    fill="#475569"
                    fontSize={11}
                    fontWeight={600}
                    formatter={(value: number) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return value.toString();
                    }}
                  />
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

