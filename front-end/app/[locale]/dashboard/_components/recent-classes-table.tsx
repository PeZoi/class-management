import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ArrowUpRight, BookOpen, Calendar, CreditCard, DollarSign, User, Users, Wallet } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ClassItem {
  id: number;
  name: string;
  teacher: string;
  students: number;
  revenue: number;
  schedule: string;
  duration: string;
  tuitionFee: number;
  collected: number;
  total: number;
}

interface RecentClassesTableProps {
  recentClasses: ClassItem[];
  formatCurrency: (amount: number) => string;
  className?: string;
}

export function RecentClassesTable({ recentClasses, formatCurrency, className }: RecentClassesTableProps) {
  const t = useTranslations('dashboard');

  return (
    <Card
      className={cn(
        'hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg',
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl md:text-2xl font-bold">{t('recentClasses')}</CardTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{t('topPerforming')}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
            <span className="hidden sm:inline">{t('viewAll')}</span>
            <ArrowUpRight className="size-3.5 md:size-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  {t('className')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <User className="size-4" />
                  {t('teacher')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="size-4" />
                  {t('students')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  {t('schedule')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Wallet className="size-4" />
                  {t('tuitionFee')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="size-4" />
                  {t('paymentStatus')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="size-4" />
                  {t('revenue')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentClasses.map((classItem) => (
              <TableRow key={classItem.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {classItem.name}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{classItem.duration}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-slate-700 dark:text-slate-300">{classItem.teacher}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-semibold">
                    {classItem.students}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="size-3.5" />
                    <span>{classItem.schedule}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(classItem.tuitionFee)}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{t('perStudent')}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">
                        {((classItem.collected / classItem.total) * 100).toFixed(0)}% (
                        {classItem.collected === classItem.total ? t('collected') : t('pending')})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(classItem.collected / classItem.total) * 100}%`,
                          background:
                            classItem.collected === classItem.total
                              ? 'linear-gradient(to right, #10b981, #059669)'
                              : classItem.collected / classItem.total >= 0.8
                                ? 'linear-gradient(to right, #3b82f6, #2563eb)'
                                : 'linear-gradient(to right, #f59e0b, #d97706)',
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(classItem.collected)}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">/ {formatCurrency(classItem.total)}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(classItem.revenue)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
