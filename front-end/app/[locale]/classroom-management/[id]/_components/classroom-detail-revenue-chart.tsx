import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { formatCurrency } from '@/utils/helper';
import { useTranslations } from 'next-intl';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

type TimePeriod = '3months' | '6months' | '12months';

interface ClassroomDetailRevenueChartProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  revenueData: Array<{ month: string; revenue: number; label: string }>;
  color: string;
}

export function ClassroomDetailRevenueChart({
  selectedPeriod,
  onPeriodChange,
  revenueData,
  color,
}: ClassroomDetailRevenueChartProps) {
  const t = useTranslations('classroom-detail');

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <CardTitle
            className="text-xl md:text-2xl font-bold text-transparent bg-clip-text"
            style={{ backgroundImage: 'linear-gradient(to right, #2563eb, #9333ea)' }}
          >
            {t('revenueChart')}
          </CardTitle>
          <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
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
      <CardContent>
        <ChartContainer
          config={{
            revenue: {
              label: t('revenue'),
              color: color,
            },
          }}
          className="h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`;
                  return value.toString();
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="bg-slate-900 dark:bg-slate-800 text-white border-slate-700"
                    labelFormatter={(label) => {
                      const item = revenueData.find((d) => d.month === label);
                      return item?.label || label;
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                }
                cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
              />
              <Bar dataKey="revenue" fill={color} radius={[8, 8, 0, 0]}>
                <LabelList
                  dataKey="revenue"
                  position="top"
                  className="fill-slate-600 dark:fill-slate-400 font-bold"
                  fontSize={12}
                  formatter={(value: number) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value;
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

