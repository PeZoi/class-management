import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/helper';
import { BookOpen, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ClassroomStatsCardsProps {
  students: number;
  revenue: number;
  tuitionFee: number;
  collected: number;
  total: number;
}

export function ClassroomStatsCards({ students, revenue, tuitionFee, collected, total }: ClassroomStatsCardsProps) {
  const t = useTranslations('classroom-detail');

  const collectionRate = ((collected / total) * 100).toFixed(1);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Students */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalStudents')}</CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Users className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{students}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('enrolledStudents')}</p>
        </CardContent>
      </Card>

      {/* Total Revenue */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalRevenue')}</CardTitle>
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <DollarSign className="size-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(revenue)}</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="size-4 text-green-600" />
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('thisMonth')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tuition Fee */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('tuitionFee')}</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <BookOpen className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(tuitionFee)}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{t('perStudent')}</p>
        </CardContent>
      </Card>

      {/* Collection Rate */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {t('collectionRate')}
          </CardTitle>
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <TrendingUp className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{collectionRate}%</div>
          <div className="mt-3 space-y-2">
            {/* Progress Bar */}
            <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-linear-to-r from-orange-500 to-amber-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Number(collectionRate)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {formatCurrency(collected)} / {formatCurrency(total)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
