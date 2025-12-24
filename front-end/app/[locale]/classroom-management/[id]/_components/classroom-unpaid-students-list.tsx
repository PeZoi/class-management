import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/helper';
import { AlertCircle, DollarSign, Mail, Phone, User2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Student {
  id: number;
  studentName: string;
  parentName: string;
  studentPhoneNumber: string;
  parentPhoneNumber: string;
  email: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  classJoinedAt: string;
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  amountPaid: number;
  totalFee: number;
}

interface ClassroomUnpaidStudentsListProps {
  students: Student[];
}

export function ClassroomUnpaidStudentsList({ students }: ClassroomUnpaidStudentsListProps) {
  const t = useTranslations('classroom-detail');

  // Filter students who haven't paid fully
  const unpaidStudents = students.filter(
    (student) => student.paymentStatus === 'unpaid' || student.paymentStatus === 'partial'
  );

  const getPaymentBadge = (status: string) => {
    const variants: Record<string, string> = {
      unpaid: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      partial: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    };
    return variants[status] || variants.unpaid;
  };

  if (unpaidStudents.length === 0) {
    return (
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="size-5 md:size-6 text-green-600 dark:text-green-400" />
            {t('unpaidStudentsList')}
            <span className="text-sm md:text-base font-normal text-slate-500 dark:text-slate-400">(0)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <AlertCircle className="size-12 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              {t('allStudentsPaid')}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{t('noUnpaidStudents')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <AlertCircle className="size-5 md:size-6 text-red-600 dark:text-red-400" />
          {t('unpaidStudentsList')}
          <span className="text-sm md:text-base font-normal text-slate-500 dark:text-slate-400">
            ({unpaidStudents.length})
          </span>
        </CardTitle>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('unpaidStudentsDescription')}</p>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <User2 className="size-4" />
                  {t('studentName')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {t('studentContact')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Phone className="size-4" />
                  {t('parentContact')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="size-4" />
                  {t('paymentStatus')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="size-4" />
                  {t('amountPaid')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <DollarSign className="size-4" />
                  {t('amountUnpaid')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unpaidStudents.map((student) => {
              const unpaidAmount = student.totalFee - student.amountPaid;
              return (
                <TableRow
                  key={student.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {student.studentName}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Phone className="size-3.5 text-slate-500" />
                        <span>{student.studentPhoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <Mail className="size-3.5 text-slate-500" />
                        <span>{student.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Phone className="size-3.5 text-slate-500" />
                      <span>{student.parentPhoneNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={getPaymentBadge(student.paymentStatus)}>
                      {t(`payment_${student.paymentStatus}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {formatCurrency(student.amountPaid)}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      / {formatCurrency(student.totalFee)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-base font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(unpaidAmount)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

