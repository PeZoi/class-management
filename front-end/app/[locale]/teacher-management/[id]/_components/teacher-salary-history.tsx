import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/utils/helper';
import { Calendar, DollarSign, FileText } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SalaryPayment {
  id: string;
  paymentDate: string;
  period: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  status: 'paid' | 'pending' | 'failed';
  notes?: string;
}

interface TeacherSalaryHistoryProps {
  salaryHistory: SalaryPayment[];
}

export function TeacherSalaryHistory({ salaryHistory }: TeacherSalaryHistoryProps) {
  const t = useTranslations('teacher-detail');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: t('cash') || 'Tiền mặt',
      bank_transfer: t('bankTransfer') || 'Chuyển khoản',
      credit_card: t('creditCard') || 'Thẻ tín dụng',
      e_wallet: t('eWallet') || 'Ví điện tử',
    };
    return methods[method] || method;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      paid: {
        label: t('paid') || 'Đã thanh toán',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      pending: {
        label: t('pending') || 'Chờ thanh toán',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      failed: {
        label: t('failed') || 'Thất bại',
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  if (salaryHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="size-5" />
            {t('salaryHistory') || 'Lịch sử thanh toán lương'}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <FileText className="size-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t('noSalaryHistory') || 'Chưa có lịch sử thanh toán'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="size-5" />
          {t('salaryHistory') || 'Lịch sử thanh toán lương'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="size-4" />
                    <span>{t('paymentDate') || 'Ngày thanh toán'}</span>
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('period') || 'Kỳ thanh toán'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                  {t('baseSalary') || 'Lương cơ bản'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                  {t('bonus') || 'Thưởng'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                  {t('deduction') || 'Khấu trừ'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                  {t('totalAmount') || 'Tổng cộng'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('paymentMethod') || 'Phương thức'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {t('status') || 'Trạng thái'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryHistory.map((payment) => (
                <TableRow
                  key={payment.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {formatDate(payment.paymentDate)}
                  </TableCell>
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {payment.period}
                  </TableCell>
                  <TableCell className="text-right text-slate-600 dark:text-slate-400">
                    {formatCurrency(payment.baseSalary)}
                  </TableCell>
                  <TableCell className="text-right text-green-600 dark:text-green-400 font-semibold">
                    +{formatCurrency(payment.bonus)}
                  </TableCell>
                  <TableCell className="text-right text-red-600 dark:text-red-400 font-semibold">
                    -{formatCurrency(payment.deduction)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(payment.totalAmount)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400 text-sm">
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(payment.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

