import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  CreditCard,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Tag,
  Wallet,
  TrendingUp,
  Banknote,
  ArrowLeftRight,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { formatCurrency, formatDate } from '@/utils/helper';

export interface PaymentHistoryItem {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  status: 'paid' | 'pending' | 'failed';
  period: string; // VD: "Tháng 12/2024"
  notes?: string;
}

interface StudentPaymentHistoryProps {
  paymentHistory: PaymentHistoryItem[];
}

export function StudentPaymentHistory({ paymentHistory }: StudentPaymentHistoryProps) {
  const t = useTranslations('student-detail');

  const getPaymentMethodBadge = (method: string) => {
    const methods: Record<string, { label: string; className: string; icon: typeof Banknote }> = {
      cash: {
        label: t('paymentMethodCash') || 'Tiền mặt',
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: Banknote,
      },
      bank_transfer: {
        label: t('paymentMethodBankTransfer') || 'Chuyển khoản',
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        icon: ArrowLeftRight,
      },
    };
    const methodConfig = methods[method] || methods.cash;
    const Icon = methodConfig.icon;
    return (
      <Badge variant="outline" className={methodConfig.className}>
        <Icon className="size-3 mr-1" />
        {methodConfig.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; icon: typeof CheckCircle; className: string }> = {
      paid: {
        label: t('statusPaid') || 'Đã thanh toán',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      pending: {
        label: t('statusPending') || 'Chờ thanh toán',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      failed: {
        label: t('statusFailed') || 'Thất bại',
        icon: Clock,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
    };
    const variant = variants[status] || variants.paid;
    const Icon = variant.icon;
    return (
      <Badge className={variant.className} variant="outline">
        <Icon className="size-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  const totalPaid = paymentHistory
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <CreditCard className="size-5 md:size-6 text-green-600 dark:text-green-400" />
            {t('paymentHistory')}
          </CardTitle>
          {totalPaid > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <DollarSign className="size-5 text-green-600 dark:text-green-400" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('totalPaid')}</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(totalPaid)}
                </span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {paymentHistory.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="size-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{t('noPaymentHistory')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-blue-600 dark:text-blue-400" />
                      {t('invoiceId')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-indigo-600 dark:text-indigo-400" />
                      {t('period')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
                      {t('paymentDate')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                    <div className="flex items-center gap-2">
                      <DollarSign className="size-4 text-green-600 dark:text-green-400" />
                      {t('amount')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Wallet className="size-4 text-orange-600 dark:text-orange-400" />
                      {t('paymentMethod')}
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-slate-600 dark:text-slate-400" />
                      {t('status')}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentHistory.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <span>#{payment.invoiceId}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
                      >
                        {payment.period}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatDate(payment.paymentDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getPaymentMethodBadge(payment.paymentMethod)}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
