import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowUpRight, BookOpen, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface StatsCardsProps {
  statsData: {
    totalRevenue: number;
    totalClasses: number;
    totalStudents: number;
    activeClasses: number;
    revenueGrowth: number;
    classGrowth: number;
    studentGrowth: number;
    activeGrowth: number;
  };
  formatCurrency: (amount: number) => string;
  className?: string;
}

export function StatsCards({ statsData, formatCurrency, className }: StatsCardsProps) {
  const t = useTranslations('dashboard');

  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Total Revenue */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalRevenue')}</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <DollarSign className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(statsData.totalRevenue)}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="size-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">{statsData.revenueGrowth}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('vsLastMonth')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Classes */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalClasses')}</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <BookOpen className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData.totalClasses}</div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="size-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">{statsData.classGrowth}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('vsLastMonth')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Students */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalStudents')}</CardTitle>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Users className="size-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {statsData.totalStudents.toLocaleString('vi-VN')}
          </div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="size-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">{statsData.studentGrowth}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('vsLastMonth')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Active Classes */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('activeClasses')}</CardTitle>
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <TrendingUp className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData.activeClasses}</div>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="size-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">{statsData.activeGrowth}%</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('vsLastMonth')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
