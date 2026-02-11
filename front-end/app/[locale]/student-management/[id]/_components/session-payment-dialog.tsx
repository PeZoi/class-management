'use client';

import { CurrencyInputField } from '@/components/currency-input-field';
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
import { SessionPaymentStatus } from '@/types';
import { formatCurrency } from '@/utils/helper';
import { CreditCard, DollarSign, Loader2, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface SessionPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: SessionPaymentStatus | null;
  monthlyFee: number;
  onSubmit: (data: {
    packageNumber: number;
    startSessionNumber: number;
    endSessionNumber: number;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => void;
  isSubmitting?: boolean;
}

export function SessionPaymentDialog({
  open,
  onOpenChange,
  payment,
  monthlyFee, // Reserved for future use
  onSubmit,
  isSubmitting,
}: SessionPaymentDialogProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = monthlyFee; // Reserved for future use
  const tPayment = useTranslations('payment-management');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Get remaining amount for selected payment
  const getRemainingAmount = useCallback((payment: SessionPaymentStatus | null) => {
    if (!payment) return 0;
    return payment.remainingAmount || (payment.expectedAmount - (payment.paidAmount || 0));
  }, []);

  // Reset form when dialog opens/closes or payment changes
  useEffect(() => {
    if (open && payment) {
      const remainingAmount = getRemainingAmount(payment);
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
    
    if (payment && !isSubmitting) {
      onSubmit({
        packageNumber: payment.packageNumber,
        startSessionNumber: payment.startSessionNumber,
        endSessionNumber: payment.endSessionNumber,
        amount: formData.amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
      });
      // Don't close dialog here - let parent handle it after successful submission
    }
  };

  const remainingAmount = getRemainingAmount(payment);
  const isFullPayment = formData.amount >= remainingAmount;

  if (!payment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl!" onInteractOutside={(e) => isSubmitting && e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <DollarSign className="size-6 text-green-600" />
            {tPayment('makePaymentTitle') || 'Thanh Toán Học Phí'}
          </DialogTitle>
          <DialogDescription>
            {tPayment('paymentForPackage', {
              packageNumber: payment.packageNumber,
              startSession: payment.startSessionNumber,
              endSession: payment.endSessionNumber,
            }) || `Thanh toán cho Gói ${payment.packageNumber} (Buổi ${payment.startSessionNumber} - ${payment.endSessionNumber})`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="py-4">
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Payment Form Fields */}
              <div className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    {tPayment('paymentAmountLabel') || 'Số tiền thanh toán'}{' '}
                    <span className="text-red-500">{tPayment('required') || '*'}</span>
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
                    placeholder={tPayment('enterAmount') || 'Nhập số tiền'}
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-slate-500">
                    {tPayment('maximum') || 'Tối đa'} {formatCurrency(remainingAmount)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">
                    {tPayment('paymentDateLabel') || 'Ngày thanh toán'}{' '}
                    <span className="text-red-500">{tPayment('required') || '*'}</span>
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
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    {tPayment('paymentMethodLabel') || 'Phương thức thanh toán'}{' '}
                    <span className="text-red-500">{tPayment('required') || '*'}</span>
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: 'cash' | 'bank_transfer') =>
                      setFormData((prev) => ({
                        ...prev,
                        paymentMethod: value,
                      }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {tPayment('method_cash') || 'Tiền mặt'}
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {tPayment('method_bank_transfer') || 'Chuyển khoản'}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 flex flex-col space-y-2">
                  <Label htmlFor="notes">{tPayment('notesLabel') || 'Ghi chú'}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder={tPayment('notesPlaceholderPayment') || 'Nhập ghi chú (nếu có)'}
                    disabled={isSubmitting}
                    className="resize-none flex-1 min-h-[120px]"
                  />
                </div>
              </div>

              {/* Right Column - Payment Info and Summary */}
              <div className="space-y-4">
                {/* Payment Info */}
                <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {tPayment('paymentInfo') || 'Thông Tin Thanh Toán'}
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-slate-500">{tPayment('packagePaymentLabel') || 'Gói thanh toán:'}:</span>
                      <div className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2 mt-1">
                        <Package className="size-4" />
                        {tPayment('packageLabel', { number: payment.packageNumber }) || `Gói ${payment.packageNumber}`}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">{tPayment('sessionRangeLabel') || 'Phạm vi buổi học:'}:</span>
                      <div className="font-medium text-slate-900 dark:text-slate-100 mt-1">
                        {tPayment('sessionRange', { 
                          start: payment.startSessionNumber, 
                          end: payment.endSessionNumber 
                        }) || `Buổi ${payment.startSessionNumber} - ${payment.endSessionNumber}`}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-500">{tPayment('totalTuitionLabel') || 'Tổng học phí'}:</span>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {formatCurrency(payment.expectedAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-500">{tPayment('paidLabel') || 'Đã đóng'}:</span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          {formatCurrency(payment.paidAmount || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 font-medium">{tPayment('remainingLabel') || 'Còn lại'}:</span>
                        <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                          {formatCurrency(remainingAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {tPayment('paymentAmountSummary') || 'Số tiền thanh toán'}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(formData.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {tPayment('totalPaidSummary') || 'Tổng đã đóng'}
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency((payment.paidAmount || 0) + formData.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-blue-200 dark:border-blue-800">
                      <span className="text-slate-600 dark:text-slate-400">
                        {tPayment('remainingAfterPayment') || 'Còn lại sau thanh toán'}
                      </span>
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
                          ✓ {tPayment('fullPayment') || 'Thanh toán đủ'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              {tCommon('cancel') || 'Hủy'}
            </Button>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700" 
              disabled={isSubmitting || formData.amount <= 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {tCommon('saving') || 'Đang lưu...'}
                </>
              ) : (
                <>
                  <DollarSign className="size-4 mr-2" />
                  {tPayment('confirmPayment') || 'Xác nhận thanh toán'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

