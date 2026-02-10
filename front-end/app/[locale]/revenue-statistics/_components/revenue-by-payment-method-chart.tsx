'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Pie, PieChart, ResponsiveContainer, Cell, Legend } from 'recharts';
import { RevenueByPaymentMethodResponse } from '@/services/dashboard-service';

type TimePeriod = '3months' | '6months' | '12months';

interface RevenueByPaymentMethodChartProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  data: RevenueByPaymentMethodResponse[];
  formatCurrency: (amount: number) => string;
  className?: string;
  isLoading: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export function RevenueByPaymentMethodChart({
  selectedPeriod,
  onPeriodChange,
  data,
  formatCurrency,
  className,
  isLoading,
}: RevenueByPaymentMethodChartProps) {
  const t = useTranslations('revenue-statistics');
  const tPayment = useTranslations('payment-management');

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case 'CASH':
        return tPayment('method_cash');
      case 'BANK_TRANSFER':
        return tPayment('method_bank_transfer');
      default:
        return method || '-';
    }
  };

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
              {t('revenueByPaymentMethod')}
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
            ) : data.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                {t('noData')}
              </div>
            ) : (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ paymentMethod, percent }) =>
                    `${getMethodLabel(paymentMethod)}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="revenue"
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      className="bg-slate-900 dark:bg-slate-800 text-white border-slate-700"
                      formatter={(value, name, props) => {
                        const payload = props.payload as RevenueByPaymentMethodResponse;
                        return [
                          <div key="tooltip" className="space-y-1">
                            <div className="font-semibold">{getMethodLabel(payload.paymentMethod)}</div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 text-xs">{t('revenue')}:</span>
                              <span className="font-bold text-white">{formatCurrency(Number(value))}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-300 text-xs">{t('transactionCount')}:</span>
                              <span className="font-bold text-white">{payload.count}</span>
                            </div>
                          </div>,
                          '',
                        ];
                      }}
                    />
                  }
                />
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value, entry) => {
                    const payload = entry.payload as RevenueByPaymentMethodResponse;
                    return getMethodLabel(payload.paymentMethod);
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

