import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, DollarSign, Users, Wallet, ExternalLink } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';

interface StatsCardsProps {
  statsData: {
    totalRevenue: number;
    totalClasses: number;
    totalStudents: number;
    totalTeachers: number;
    totalSalaryExpense: number;
    revenueGrowth: number;
    studentGrowth: number;
    salaryExpenseGrowth: number;
  };
  formatCurrency: (amount: number) => string;
  className?: string;
}

export function StatsCards({ statsData, formatCurrency, className }: StatsCardsProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const revenueGrowth = statsData.revenueGrowth ?? 0;
  const RevenueGrowthIcon = revenueGrowth >= 0 ? ArrowUpRight : ArrowDownRight;

  const salaryExpenseGrowth = statsData.salaryExpenseGrowth ?? 0;
  const SalaryExpenseGrowthIcon = salaryExpenseGrowth >= 0 ? ArrowUpRight : ArrowDownRight;

  const studentGrowth = statsData.studentGrowth ?? 0;
  const StudentGrowthIcon = studentGrowth >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-4', className)}>
      {/* Total Revenue */}
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500 group">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 dark:group-hover:text-blue-400 transition-colors">
            {t('totalRevenue')}
          </CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <DollarSign className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(statsData.totalRevenue)}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <RevenueGrowthIcon className={`size-4 ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span
                className={`text-sm font-medium ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {Math.abs(revenueGrowth).toFixed(0)}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('vsLastMonth')}</span>
            </div>
            <Link
              href={`/${locale}/revenue-statistics`}
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              <span>{t('viewDetails')}</span>
              <ExternalLink className="size-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Total Salary Expense */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalSalaryExpense')}</CardTitle>
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Wallet className="size-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(statsData.totalSalaryExpense)}
          </div>
          {statsData.salaryExpenseGrowth !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <SalaryExpenseGrowthIcon
                className={`size-4 ${salaryExpenseGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              />
              <span
                className={`text-sm font-medium ${salaryExpenseGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {Math.abs(salaryExpenseGrowth).toFixed(0)}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('vsLastMonth')}</span>
            </div>
          )}
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
            <StudentGrowthIcon className={`size-4 ${studentGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span
              className={`text-sm font-medium ${studentGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {Math.abs(studentGrowth).toFixed(0)}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{t('vsLastMonth')}</span>
          </div>
        </CardContent>
      </Card>

      {/* Total Teachers */}
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-orange-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">{t('totalTeachers')}</CardTitle>
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Users className="size-5 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{statsData.totalTeachers}</div>
        </CardContent>
      </Card>
    </div>
  );
}
