import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/helper';
import { ColumnDef } from '@tanstack/react-table';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Edit,
  FileText,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { PaymentItem } from '@/types';

interface PaymentTableProps {
  payments: PaymentItem[];
  onEdit?: (payment: PaymentItem) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
  onPersonClick?: (payment: PaymentItem) => void;
  title?: string;
  description?: string;
  showActions?: boolean;
  className?: string;
  isLoading?: boolean;
  error?: string;
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
  isLoading,
  error,
}: PaymentTableProps) {
  const t = useTranslations('payment-management');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string>('');

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

  const columns: ColumnDef<PaymentItem>[] = [
    {
      accessorKey: 'invoiceId',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <FileText className="size-4" />
            {t('invoiceId')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
          #{row.original.invoiceId}
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <Tag className="size-4" />
            {t('typeLabel')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="text-center">{getTypeBadge(row.original.type)}</div>
      ),
    },
    {
      id: 'relatedPerson',
      header: () => (
        <div className="flex items-center gap-2">
          <User className="size-4" />
          {t('relatedPersonLabel')}
        </div>
      ),
      cell: ({ row }) => {
        const payment = row.original;
        const displayName = payment.type === 'income' ? payment.studentName : payment.teacherName;
        const displayGender = payment.type === 'income' ? payment.studentGender : payment.teacherGender;
        
        const getGenderLabel = (gender?: string) => {
          if (!gender) return '';
          if (gender === 'MALE') return t('male');
          if (gender === 'FEMALE') return t('female');
          if (gender === 'OTHER') return t('other');
          return '';
        };
        
        return (
          <div className="font-medium text-slate-900 dark:text-slate-100">
            {displayName ? (
              <button
                onClick={() => onPersonClick?.(payment)}
                className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer group w-full text-left"
              >
                <User className="size-4 text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="underline decoration-transparent group-hover:decoration-blue-600 dark:group-hover:decoration-blue-400 transition-all truncate">
                    {displayName}
                  </div>
                  {displayGender && (
                    <div className="text-xs text-slate-500">
                      {getGenderLabel(displayGender)}
                    </div>
                  )}
                </div>
              </button>
            ) : (
              <span className="text-slate-400 text-sm">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'className',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <BookOpen className="size-4" />
            {t('className')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const payment = row.original;
        const displayClass = payment.type === 'income' ? payment.className : '-';
        
        return (
          <div className='text-center'>
            {displayClass !== '-' ? (
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-xs font-medium">
                {displayClass}
              </span>
            ) : (
              <span className="text-slate-400 text-sm">-</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'period',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="size-4" />
            {t('period')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="text-center">
          {row.original.period ? (
            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-xs font-medium">
              {row.original.period}
            </span>
          ) : (
            <span className="text-slate-400 text-sm">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'paidAmount',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-end">
          <div className="flex items-center justify-end gap-2">
            <CreditCard className="size-4" />
            {t('amount')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        const payment = row.original;
        const isExpense = payment.type === 'expense';
        const hasSalaryDetails = isExpense && (payment.feeSnapshot !== undefined || payment.bonus !== undefined || payment.deduction !== undefined);

        const amountCell = (
          <div className="text-right">
            <div className="font-medium text-slate-900 dark:text-slate-100">
              {formatCurrency(payment.paidAmount)}
            </div>
          </div>
        );

        if (hasSalaryDetails) {
          const baseSalary = payment.feeSnapshot ?? 0;
          const bonus = payment.bonus ?? 0;
          const deduction = payment.deduction ?? 0;
          const total = baseSalary + bonus - deduction;

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-right cursor-help">
                  <div className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {formatCurrency(payment.paidAmount)}
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent 
                side="left" 
                className="max-w-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg p-3"
              >
                <div className="space-y-2">
                  <div className="font-semibold text-sm mb-2 border-b border-slate-300 dark:border-slate-600 pb-1.5 text-slate-900 dark:text-slate-100">
                    {t('salaryBreakdown')}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{t('baseSalary')}:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(baseSalary)}</span>
                    </div>
                    {bonus > 0 && (
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{t('bonus')}:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">+{formatCurrency(bonus)}</span>
                      </div>
                    )}
                    {deduction > 0 && (
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{t('deduction')}:</span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400">-{formatCurrency(deduction)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center gap-4 pt-2 border-t border-slate-300 dark:border-slate-600 mt-1.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{t('total')}:</span>
                      <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span>
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        }

        return amountCell;
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.paidAmount - rowB.original.paidAmount;
      },
    },
    {
      accessorKey: 'createdDate',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <Calendar className="size-4" />
            {t('createdDateTimeLabel')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="text-center text-sm text-slate-700 dark:text-slate-300 font-medium">
          {formatDateTime(row.original.createdDate)}
        </div>
      ),
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.createdDate).getTime();
        const dateB = new Date(rowB.original.createdDate).getTime();
        return dateA - dateB;
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <CreditCard className="size-4" />
          {t('paymentMethod')}
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-center">{getPaymentMethodBadge(row.original.paymentMethod)}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-center">
          <div className="flex items-center justify-center gap-2">
            <Activity className="size-4" />
            {t('statusLabel')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => (
        <div className="text-center">{getStatusBadge(row.original.status)}</div>
      ),
    },
    {
      accessorKey: 'note',
      header: () => (
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-slate-600 dark:text-slate-400" />
          {t('notes')}
        </div>
      ),
      cell: ({ row }) => {
        const notes = row.original.note || '';
        const hasNotes = notes.trim().length > 0;

        if (!hasNotes) {
          return (
            <div className="text-sm text-slate-400 dark:text-slate-500 italic">
              {t('noNotes')}
            </div>
          );
        }

        return (
          <div
            onClick={() => {
              setSelectedNotes(notes);
              setNotesDialogOpen(true);
            }}
            className={cn(
              'text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-slate-100 transition-colors',
            )}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.5',
              maxHeight: '3em', // 2 lines * 1.5 line-height
            }}
            title={notes.length > 100 ? notes : undefined}
          >
            {notes}
          </div>
        );
      },
    },
  ];

  if (showActions) {
    columns.push({
      id: 'actions',
      header: () => <div className="text-center">{t('actions')}</div>,
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="text-center">
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
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      // Sử dụng backendId (ID thực sự từ backend) hoặc invoiceId (paymentId)
                      const paymentId = payment.backendId || payment.invoiceId;
                      
                      if (!paymentId) {
                        throw new Error(t('errorPaymentIdNotFound'));
                      }
                      
                      const { paymentService } = await import('@/services/payment-service');
                      await paymentService.downloadInvoiceAndSave(paymentId, `invoice_${payment.invoiceId}.pdf`);
                    } catch (error) {
                      console.error('Lỗi khi tải hóa đơn:', error);
                      const errorMessage = error instanceof Error ? error.message : '';
                      alert(t('errorDownloadInvoiceGeneric', { error: errorMessage }));
                    }
                  }}
                >
                  <Download className="size-4 mr-2" />
                  {t('downloadInvoice')}
                </DropdownMenuItem>
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
          </div>
        );
      },
    });
  }

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
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('loading')}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('noPaymentsFound')}</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={payments}
            getRowClassName={(payment) =>
              payment.type === 'income'
                ? 'bg-green-50/30 dark:bg-green-950/10 hover:bg-green-50/50 dark:hover:bg-green-950/20'
                : 'bg-red-50/30 dark:bg-red-950/10 hover:bg-red-50/50 dark:hover:bg-red-950/20'
            }
          />
        )}
      </CardContent>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-slate-600 dark:text-slate-400" />
              {t('notes')}
            </DialogTitle>
            <DialogDescription>
              {t('notesDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word">
                {selectedNotes || t('noNotes')}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
