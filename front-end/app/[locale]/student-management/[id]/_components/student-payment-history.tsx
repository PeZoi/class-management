'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { formatCurrency, formatDateTime } from '@/utils/helper';
import {
  ArrowLeftRight,
  Banknote,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  MessageSquare,
  Tag,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface PaymentHistoryItem {
  id: string;
  invoiceId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  status: 'paid' | 'partial';
  period: string; // VD: "Tháng 12/2024"
  notes?: string;
}

interface StudentPaymentHistoryProps {
  paymentHistory: PaymentHistoryItem[];
}

export function StudentPaymentHistory({ paymentHistory }: StudentPaymentHistoryProps) {
  const t = useTranslations('student-detail');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string>('');

  const getPaymentMethodBadge = (method: string) => {
    const methods: Record<string, { label: string; className: string; icon: typeof Banknote }> = {
      cash: {
        label: t('paymentMethodCash') || 'Tiền mặt',
        className:
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: Banknote,
      },
      bank_transfer: {
        label: t('paymentMethodBankTransfer') || 'Chuyển khoản',
        className:
          'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
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
        label: t('statusPaid'),
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      partial: {
        label: t('statusPending') || 'Đóng một phần',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
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

  // Helper function to parse period string "Tháng X/YYYY" to date for sorting
  const parsePeriodToDate = (period: string): number => {
    // Match pattern "Tháng X/YYYY" or "Tháng XX/YYYY"
    const match = period.match(/Tháng\s+(\d+)\/(\d+)/);
    if (match) {
      const month = parseInt(match[1], 10);
      const year = parseInt(match[2], 10);
      // Create date object for comparison (first day of month)
      return new Date(year, month - 1, 1).getTime();
    }
    // If parsing fails, return 0 (will be sorted first or last)
    return 0;
  };

  const columns: ColumnDef<PaymentHistoryItem>[] = [
    {
      accessorKey: 'invoiceId',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-blue-600 dark:text-blue-400" />
            {t('invoiceId')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="font-mono text-sm font-medium text-slate-900 dark:text-slate-100">
            #{row.original.invoiceId}
          </div>
        );
      },
    },
    {
      accessorKey: 'period',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <Tag className="size-4 text-indigo-600 dark:text-indigo-400" />
            {t('period')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <Badge
            variant="outline"
            className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800"
          >
            {row.original.period}
          </Badge>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = parsePeriodToDate(rowA.original.period);
        const dateB = parsePeriodToDate(rowB.original.period);
        return dateA - dateB;
      },
    },
    {
      accessorKey: 'paymentDate',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
            {t('paymentDate')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Calendar className="size-4 opacity-60" />
            <span className="text-sm font-medium">{formatDateTime(row.original.paymentDate)}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.paymentDate).getTime();
        const dateB = new Date(rowB.original.paymentDate).getTime();
        return dateA - dateB;
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-end">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-green-600 dark:text-green-400" />
            {t('amount')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(row.original.amount)}
            </span>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.amount - rowB.original.amount;
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <Wallet className="size-4 text-orange-600 dark:text-orange-400" />
          {t('paymentMethod')}
        </div>
      ),
      cell: ({ row }) => {
        return <div className="text-center">{getPaymentMethodBadge(row.original.paymentMethod)}</div>;
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-slate-600 dark:text-slate-400" />
            {t('status')}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return getStatusBadge(row.original.status);
      },
    },
    {
      accessorKey: 'notes',
      header: () => (
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-slate-600 dark:text-slate-400" />
          {t('notes')}
        </div>
      ),
      cell: ({ row }) => {
        const notes = row.original.notes || '';
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

  const totalPaid = paymentHistory.reduce((sum, p) => sum + p.amount, 0);

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
          <DataTable columns={columns} data={paymentHistory} />
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
            <DialogDescription>{t('notesDescription')}</DialogDescription>
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
