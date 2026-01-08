'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInputField } from '@/components/currency-input-field';
import { formatCurrency } from '@/utils/helper';
import { DollarSign, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { PaymentMonthStatus } from './payment-status-calendar';

interface MonthlyPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentMonthStatus | null;
  monthlyFee: number;
  monthNames: string[];
  onSubmit: (data: {
    month: number;
    year: number;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => void;
}

export function MonthlyPaymentDialog({
  open,
  onOpenChange,
  payment,
  monthlyFee,
  monthNames,
  onSubmit,
}: MonthlyPaymentDialogProps) {
  const tPayment = useTranslations('payment-management');

  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Get remaining amount for selected payment
  const getRemainingAmount = useCallback((payment: PaymentMonthStatus | null) => {
    if (!payment) return 0;
    return (payment.amount || monthlyFee) - (payment.paidAmount || 0);
  }, [monthlyFee]);

  // Reset form when dialog opens/closes or payment changes
  useEffect(() => {
    if (open && payment) {
      const remainingAmount = getRemainingAmount(payment);
      setFormData({
        amount: remainingAmount,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [open, payment, getRemainingAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (payment) {
      onSubmit({
        month: payment.month,
        year: payment.year,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
      });
      onOpenChange(false);
    }
  };

  const remainingAmount = getRemainingAmount(payment);
  const isFullPayment = formData.amount >= remainingAmount;

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="size-6 text-green-600" />
            Đóng Tiền Học Phí
          </DialogTitle>
          <DialogDescription>
            {`Thanh toán cho tháng ${monthNames[payment.month - 1]} ${payment.year}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Payment Info */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Thông Tin Thanh Toán
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Tháng:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {monthNames[payment.month - 1]} {payment.year}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Tổng học phí:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(payment.amount || monthlyFee)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Đã thanh toán:</span>
                  <div className="font-medium text-green-600 dark:text-green-400">
                    {formatCurrency(payment.paidAmount || 0)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500">Còn lại:</span>
                  <div className="font-bold text-lg text-orange-600 dark:text-orange-400">
                    {formatCurrency(remainingAmount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Số Tiền Thanh Toán <span className="text-red-500">*</span>
                  </Label>
                  <CurrencyInputField
                    id="amount"
                    value={formData.amount}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        amount: value,
                      }))
                    }
                    placeholder="Nhập số tiền"
                    required
                  />
                  <p className="text-xs text-slate-500">
                    Tối đa: {formatCurrency(remainingAmount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">
                    Ngày Thanh Toán <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentDate: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="paymentMethod">
                    Phương Thức Thanh Toán <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: 'cash' | 'bank_transfer') =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: value,
                      }))
                    }
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {tPayment('method_cash')}
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {tPayment('method_bank_transfer')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi Chú</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Ghi chú thêm về khoản thanh toán này..."
                  rows={3}
                />
              </div>
            </div>

            {/* Payment Summary */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Số tiền thanh toán:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(formData.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Tổng đã thanh toán:</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency((payment.paidAmount || 0) + formData.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="text-slate-600 dark:text-slate-400">Còn lại sau thanh toán:</span>
                  <span
                    className={`font-bold text-lg ${
                      isFullPayment
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    {formatCurrency(Math.max(0, remainingAmount - formData.amount))}
                  </span>
                </div>
                {isFullPayment && (
                  <div className="text-center pt-2">
                    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-sm font-medium">
                      ✓ Thanh toán đầy đủ
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <DollarSign className="size-4 mr-2" />
              Xác Nhận Thanh Toán
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

