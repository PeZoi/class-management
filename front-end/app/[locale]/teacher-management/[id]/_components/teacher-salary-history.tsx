'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable, SortableHeader } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

export interface SalaryPayment {
  id: string;
  invoiceId: string;
  paymentDate: string;
  period: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer';
  status: 'paid' | 'partial';
  notes?: string;
}

interface TeacherSalaryHistoryProps {
  salaryHistory: SalaryPayment[];
}

export function TeacherSalaryHistory({ salaryHistory }: TeacherSalaryHistoryProps) {
  const t = useTranslations('teacher-detail');
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string>('');

  const getPaymentMethodBadge = (method: string) => {
    const methods: Record<string, { label: string; className: string; icon: typeof Banknote }> = {
      cash: {
        label: t('cash') || 'Tiền mặt',
        className:
          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: Banknote,
      },
      bank_transfer: {
        label: t('bankTransfer') || 'Chuyển khoản',
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
        label: t('paid') || 'Đã thanh toán',
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      partial: {
        label: t('partial') || 'Trả một phần',
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
    const match = period.match(/Tháng\s+(\d+)\/(\d+)/);
    if (match) {
      const month = parseInt(match[1], 10);
      const year = parseInt(match[2], 10);
      return new Date(year, month - 1, 1).getTime();
    }
    return 0;
  };

  const columns: ColumnDef<SalaryPayment>[] = [
    {
      accessorKey: 'invoiceId',
      header: ({ column }) => (
        <SortableHeader column={column}>
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-blue-600 dark:text-blue-400" />
            {t('invoiceId') || 'Mã hóa đơn'}
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
            {t('period') || 'Kỳ thanh toán'}
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
            {t('paymentDate') || 'Ngày thanh toán'}
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
      accessorKey: 'baseSalary',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-end">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-slate-600 dark:text-slate-400" />
            {t('baseSalary') || 'Lương cơ bản'}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <div className="text-right">
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {formatCurrency(row.original.baseSalary)}
              </span>
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.baseSalary - rowB.original.baseSalary;
      },
    },
    {
      accessorKey: 'bonus',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-end">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-green-600 dark:text-green-400" />
            {t('bonus') || 'Thưởng'}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <div className="text-right">
              {row.original.bonus > 0 ? (
                <span className="font-semibold text-green-600 dark:text-green-400">
                  +{formatCurrency(row.original.bonus)}
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">-</span>
              )}
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.bonus - rowB.original.bonus;
      },
    },
    {
      accessorKey: 'deduction',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-end">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-4 text-red-600 dark:text-red-400 rotate-180" />
            {t('deduction') || 'Khấu trừ'}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <div className="text-right">
              {row.original.deduction > 0 ? (
                <span className="font-semibold text-red-600 dark:text-red-400">
                  -{formatCurrency(row.original.deduction)}
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500">-</span>
              )}
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.deduction - rowB.original.deduction;
      },
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <SortableHeader column={column} className="justify-end">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-green-600 dark:text-green-400" />
            {t('totalAmount') || 'Tổng cộng'}
          </div>
        </SortableHeader>
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <div className="text-right">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(row.original.totalAmount)}
              </span>
            </div>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        return rowA.original.totalAmount - rowB.original.totalAmount;
      },
    },
    {
      accessorKey: 'paymentMethod',
      header: () => (
        <div className="flex items-center justify-center gap-2">
          <Wallet className="size-4 text-orange-600 dark:text-orange-400" />
          {t('paymentMethod') || 'Phương thức'}
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
            {t('status') || 'Trạng thái'}
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
          {t('notes') || 'Ghi chú'}
        </div>
      ),
      cell: ({ row }) => {
        const notes = row.original.notes || '';
        const hasNotes = notes.trim().length > 0;

        if (!hasNotes) {
          return (
            <div className="text-sm text-slate-400 dark:text-slate-500 italic">
              {t('noNotes') || 'Không có ghi chú'}
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
              maxHeight: '3em',
            }}
            title={notes.length > 100 ? notes : undefined}
          >
            {notes}
          </div>
        );
      },
    },
  ];

  const totalPaid = salaryHistory.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <CreditCard className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
            {t('salaryHistory') || 'Lịch sử thanh toán lương'}
          </CardTitle>
          {totalPaid > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <DollarSign className="size-5 text-blue-600 dark:text-blue-400" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('totalPaid') || 'Tổng đã trả'}</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatCurrency(totalPaid)}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {salaryHistory.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="size-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{t('noSalaryHistory') || 'Chưa có lịch sử thanh toán'}</p>
          </div>
        ) : (
          <DataTable columns={columns} data={salaryHistory} />
        )}
      </CardContent>

      {/* Notes Dialog */}
      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5 text-slate-600 dark:text-slate-400" />
              {t('notes') || 'Ghi chú'}
            </DialogTitle>
            <DialogDescription>{t('notesDescription') || 'Nội dung ghi chú đầy đủ'}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap wrap-break-word">
                {selectedNotes || t('noNotes') || 'Không có ghi chú'}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
