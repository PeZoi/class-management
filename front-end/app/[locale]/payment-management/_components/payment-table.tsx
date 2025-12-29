import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/helper';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Edit,
  FileText,
  MoreHorizontal,
  Plus,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PaymentItem } from '../payment-management';

interface PaymentTableProps {
  payments: PaymentItem[];
  onEdit?: (payment: PaymentItem) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  onPersonClick?: (name: string, type: 'student' | 'teacher') => void;
  title?: string;
  description?: string;
  showActions?: boolean;
  className?: string;
}

export function PaymentTable({
  payments,
  onEdit,
  onDelete,
  onAdd,
  onPersonClick,
  title,
  description,
  showActions = true,
  className,
}: PaymentTableProps) {
  const t = useTranslations('payment-management');

  const displayTitle = title || t('title');
  const displayDescription = description || t('description');

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getTypeBadge = (type: 'income' | 'expense') => {
    const typeConfig = {
      income: {
        label: t('type_income'),
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: ArrowDownCircle,
      },
      expense: {
        label: t('type_expense'),
        className: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
        icon: ArrowUpCircle,
      },
    };

    const config = typeConfig[type];
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.className)}>
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  };

  const getPaymentMethodBadge = (method: string) => {
    const methodConfig = {
      cash: {
        label: t('method_cash'),
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      bank_transfer: {
        label: t('method_bank_transfer'),
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
      credit_card: {
        label: t('method_credit_card'),
        className: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
      },
      e_wallet: {
        label: t('method_e_wallet'),
        className: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      },
    };

    const config = methodConfig[method as keyof typeof methodConfig] || methodConfig.cash;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium', config.className)}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: 'paid' | 'partial') => {
    const statusConfig = {
      paid: {
        label: t('status_completed'),
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: CheckCircle,
      },
      partial: {
        label: t('status_incomplete'),
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        icon: Clock,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', config.className)}>
        <Icon className="size-3" />
        {config.label}
      </span>
    );
  };

  const getRowBackground = (type: 'income' | 'expense') => {
    return type === 'income'
      ? 'bg-green-50/30 dark:bg-green-950/10 hover:bg-green-50/50 dark:hover:bg-green-950/20'
      : 'bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50/50 dark:hover:bg-red-950/20';
  };

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
            <CardTitle className="text-xl md:text-2xl font-bold">{displayTitle}</CardTitle>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">{displayDescription}</p>
          </div>
          {showActions && onAdd && (
            <Button onClick={onAdd} className="gap-2">
              <Plus className="size-4" />
              <span className="hidden sm:inline">{t('addPayment')}</span>
              <span className="sm:hidden">{t('addPaymentShort')}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table className={cn('min-w-[1200px]', showActions && 'min-w-[1300px]')}>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <FileText className="size-4" />
                  {t('invoiceId')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Tag className="size-4" />
                  {t('typeLabel')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="size-4" />
                  {t('relatedPersonLabel')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4" />
                  {t('className')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-right">
                <div className="flex items-center justify-end gap-2">
                  <CreditCard className="size-4" />
                  {t('amount')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="size-4" />
                  {t('createdDateTimeLabel')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <CreditCard className="size-4" />
                  {t('paymentMethod')}
                </div>
              </TableHead>
              <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Activity className="size-4" />
                  {t('statusLabel')}
                </div>
              </TableHead>
              {showActions && (
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {t('actions')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showActions ? 9 : 8} className="h-24 text-center text-slate-500">
                  {t('noPaymentsFound')}
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const displayName = payment.type === 'income' 
                  ? payment.studentName 
                  : payment.teacherName;
                const displayClass = payment.type === 'income' 
                  ? payment.className 
                  : '-';

                return (
                  <TableRow
                    key={payment.id}
                    className={cn(
                      'transition-colors',
                      getRowBackground(payment.type)
                    )}
                  >
                    <TableCell className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
                      #{payment.invoiceId}
                    </TableCell>
                    <TableCell className="text-center">
                      {getTypeBadge(payment.type)}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                      {displayName ? (
                        <button
                          onClick={() => onPersonClick?.(displayName, payment.type === 'income' ? 'student' : 'teacher')}
                          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group"
                        >
                          <User className="size-4 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                          <span className="underline decoration-transparent group-hover:decoration-blue-600 dark:group-hover:decoration-blue-400 transition-all">
                            {displayName}
                          </span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {displayClass !== '-' ? (
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
                          {displayClass}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        <div className="font-bold text-lg text-slate-900 dark:text-slate-100">
                          {formatCurrency(payment.totalAmount)}
                        </div>
                        {payment.status === 'partial' && (
                          <div className="text-xs space-y-0.5">
                            <div className="text-green-600 dark:text-green-400">
                              {t('paidLabel')} {formatCurrency(payment.paidAmount)}
                            </div>
                            <div className="text-orange-600 dark:text-orange-400 font-medium">
                              {t('remainingLabel')} {formatCurrency(payment.totalAmount - payment.paidAmount)}
                            </div>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                        {formatDateTime(payment.createdDate)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getPaymentMethodBadge(payment.paymentMethod)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    {showActions && (
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="size-8 p-0">
                              <span className="sr-only">{t('openMenu')}</span>
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {onEdit && (
                              <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(payment)}>
                                <Edit className="size-4 mr-2" />
                                {t('edit')}
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600 dark:text-red-400"
                                onClick={() => {
                                  if (window.confirm(t('confirmDelete'))) {
                                    onDelete(payment.id);
                                  }
                                }}
                              >
                                <Trash2 className="size-4 mr-2" />
                                {t('delete')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
