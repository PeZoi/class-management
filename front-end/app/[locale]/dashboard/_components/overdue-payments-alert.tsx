import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { AlertTriangle, ArrowUpRight, BookOpen, Clock, DollarSign, Eye, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { StudentDetailDrawer } from './student-detail-drawer';

interface OverduePayment {
  id: number;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  studentGender?: string;
  studentBirthDate?: string;
  startDate?: string;
  className: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
  contacted: boolean;
  parentName?: string;
  parentPhone?: string;
}

interface OverduePaymentsAlertProps {
  overduePayments: OverduePayment[];
  formatCurrency: (amount: number) => string;
  className?: string;
}

export function OverduePaymentsAlert({ overduePayments, formatCurrency, className }: OverduePaymentsAlertProps) {
  const t = useTranslations('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<OverduePayment | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleViewDetail = (payment: OverduePayment) => {
    setSelectedStudent(payment);
    setIsDrawerOpen(true);
  };

  return (
    <Card
      className={cn(
        'hover:shadow-xl transition-all duration-300 bg-white dark:bg-slate-900 border-0 shadow-lg flex flex-col h-full',
        className,
      )}
    >
      <CardHeader className="pb-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="size-5 md:size-6 text-red-500 shrink-0" />
              <span className="text-red-600 dark:text-red-400 truncate">{t('overduePayments')}</span>
            </CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 ml-7 md:ml-8">{t('overduePaymentsDesc')}</p>
          </div>
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Badge variant="destructive" className="text-xs md:text-sm px-2 md:px-3 py-1 text-white whitespace-nowrap">
              {overduePayments.length} {t('students_count')}
            </Badge>
            <Button variant="outline" size="sm" className="gap-1 md:gap-2 text-xs md:text-sm">
              <span className="hidden sm:inline">{t('viewAll')}</span>
              <ArrowUpRight className="size-3.5 md:size-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-h-[348px] overflow-y-auto overflow-x-hidden">
        <div className="min-w-full">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[25%]">
                  <div className="flex items-center gap-2">
                    <User className="size-4 shrink-0" />
                    <span className="truncate">{t('studentName')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 w-[25%]">
                  <div className="flex items-center gap-2">
                    <BookOpen className="size-4 shrink-0" />
                    <span className="truncate">{t('class')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right w-[20%]">
                  <div className="flex items-center justify-end gap-2">
                    <DollarSign className="size-4 shrink-0" />
                    <span className="truncate">{t('amountDue')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center w-[15%]">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="size-4 shrink-0" />
                    <span className="truncate">{t('daysOverdue')}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center w-[15%]">
                  {t('actions')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overduePayments.map((payment) => (
                <TableRow key={payment.id} className="group hover:bg-red-50 dark:hover:bg-red-900/10">
                  <TableCell className="font-medium w-[25%]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {payment.studentName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="w-[25%]">
                    <span className="text-slate-700 dark:text-slate-300 text-sm truncate block">
                      {payment.className}
                    </span>
                  </TableCell>
                  <TableCell className="text-right w-[20%]">
                    <span className="font-bold text-red-600 dark:text-red-400 text-sm whitespace-nowrap">
                      {formatCurrency(payment.amountDue)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center w-[15%]">
                    <Badge
                      variant={
                        payment.daysOverdue > 30 ? 'destructive' : payment.daysOverdue > 14 ? 'warning' : 'secondary'
                      }
                      className="whitespace-nowrap text-xs"
                    >
                      {payment.daysOverdue} {t('days')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center w-[15%]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(payment)}
                      className="gap-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all text-xs whitespace-nowrap px-2"
                    >
                      <Eye className="size-3.5" />
                      <span className="hidden lg:inline">{t('viewDetail')}</span>
                      <span className="lg:hidden">{t('viewDetail')}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Student Detail Drawer */}
      <StudentDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        student={selectedStudent}
        formatCurrency={formatCurrency}
      />
    </Card>
  );
}
