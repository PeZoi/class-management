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
import { DollarSign, CreditCard, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { SalaryMonthStatus } from '@/types';

interface TeacherMonthlySalaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salary: SalaryMonthStatus | null;
  baseSalary: number;
  monthNames: string[];
  onSubmit: (data: {
    month: number;
    year: number;
    baseSalary: number;
    bonus: number;
    deduction: number;
    totalAmount: number;
    paymentMethod: 'cash' | 'bank_transfer';
    paymentDate: string;
    notes: string;
  }) => void;
  isSubmitting?: boolean;
}

export function TeacherMonthlySalaryDialog({
  open,
  onOpenChange,
  salary,
  baseSalary,
  monthNames,
  onSubmit,
  isSubmitting,
}: TeacherMonthlySalaryDialogProps) {
  const tPayment = useTranslations('payment-management');
  const t = useTranslations('teacher-detail');
  const tCommon = useTranslations('common');

  const [formData, setFormData] = useState({
    baseSalary: baseSalary,
    bonus: 0,
    deduction: 0,
    paymentMethod: 'cash' as 'cash' | 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Calculate total amount using useMemo
  const totalAmount = useMemo(() => {
    return Math.max(0, formData.baseSalary + formData.bonus - formData.deduction);
  }, [formData.baseSalary, formData.bonus, formData.deduction]);

  // Get remaining amount for selected salary
  const getRemainingAmount = useCallback((salary: SalaryMonthStatus | null) => {
    if (!salary) return baseSalary;
    return (salary.totalAmount || baseSalary) - (salary.paidAmount || 0);
  }, [baseSalary]);

  // Reset form when dialog opens/closes or salary changes
  useEffect(() => {
    if (open && salary) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        baseSalary: salary.baseSalary || baseSalary,
        bonus: salary.bonus || 0,
        deduction: salary.deduction || 0,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } else if (open && !salary) {
      // New payment
      setFormData({
        baseSalary: baseSalary,
        bonus: 0,
        deduction: 0,
        paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
    }
  }, [open, salary, baseSalary]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (salary) {
      onSubmit({
        month: salary.month,
        year: salary.year,
        baseSalary: formData.baseSalary,
        bonus: formData.bonus,
        deduction: formData.deduction,
        totalAmount: totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        notes: formData.notes,
      });
      // Don't close dialog here - parent will close it after successful mutation
    }
  };

  const remainingAmount = getRemainingAmount(salary);
  const isFullPayment = totalAmount >= remainingAmount;

  if (!salary) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <DollarSign className="size-5 text-blue-600" />
            {t('paySalary') || 'Trả Lương Cho Giáo Viên'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {`${tCommon('month') || 'Tháng'} ${monthNames[salary.month - 1]} ${salary.year}`}
            {remainingAmount > 0 && (
              <span className="ml-2 text-orange-600 dark:text-orange-400">
                • {t('remaining') || 'Còn lại'}: {formatCurrency(remainingAmount)}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            {/* Salary Form - Compact Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="baseSalary" className="text-sm">
                  {t('baseSalary') || 'Lương cơ bản'} <span className="text-red-500">*</span>
                </Label>
                <CurrencyInputField
                  id="baseSalary"
                  value={formData.baseSalary}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      baseSalary: value,
                    }))
                  }
                  placeholder={t('enterBaseSalary') || 'Nhập lương cơ bản'}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bonus" className="text-sm">
                  {t('bonus') || 'Thưởng'}
                </Label>
                <CurrencyInputField
                  id="bonus"
                  value={formData.bonus}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      bonus: Math.max(0, value),
                    }))
                  }
                  placeholder={t('enterBonus') || 'Nhập số tiền thưởng'}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="deduction" className="text-sm">
                  {t('deduction') || 'Khấu trừ'}
                </Label>
                <CurrencyInputField
                  id="deduction"
                  value={formData.deduction}
                  onChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      deduction: Math.max(0, value),
                    }))
                  }
                  placeholder={t('enterDeduction') || 'Nhập số tiền khấu trừ'}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentDate" className="text-sm">
                  {tPayment('paymentDate') || 'Ngày Thanh Toán'} <span className="text-red-500">*</span>
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

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="paymentMethod" className="text-sm">
                  {tPayment('paymentMethod') || 'Phương Thức Thanh Toán'} <span className="text-red-500">*</span>
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

              <div className="space-y-1.5 col-span-2">
                <Label htmlFor="notes" className="text-sm">{tPayment('notes') || 'Ghi Chú'}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder={tPayment('notesPlaceholder') || 'Ghi chú thêm về khoản thanh toán này...'}
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Compact Summary */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400">{t('baseSalary') || 'Lương cơ bản'}:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(formData.baseSalary)}
                  </span>
                </div>
                {formData.bonus > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-600 dark:text-green-400">{t('bonus') || 'Thưởng'}:</span>
                    <span className="font-medium text-green-600 dark:text-green-400">
                      +{formatCurrency(formData.bonus)}
                    </span>
                  </div>
                )}
                {formData.deduction > 0 && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-red-600 dark:text-red-400">{t('deduction') || 'Khấu trừ'}:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      -{formatCurrency(formData.deduction)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1.5 border-t border-blue-200 dark:border-blue-800">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{t('totalAmount') || 'Tổng cộng'}:</span>
                  <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                {remainingAmount > 0 && (
                  <div className="flex justify-between items-center text-xs pt-1 border-t border-blue-200 dark:border-blue-800">
                    <span className="text-slate-600 dark:text-slate-400">{t('remainingAfterPayment') || 'Còn lại sau thanh toán'}:</span>
                    <span
                      className={`font-semibold ${
                        isFullPayment
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      }`}
                    >
                      {formatCurrency(Math.max(0, remainingAmount - totalAmount))}
                    </span>
                  </div>
                )}
                {isFullPayment && (
                  <div className="text-center pt-1">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-medium">
                      ✓ {tPayment('fullPayment') || 'Thanh toán đầy đủ'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {tCommon('cancel') || 'Hủy'}
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={!!isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {tCommon('saving')}
                </>
              ) : (
                <>
                  <DollarSign className="size-4 mr-2" />
                  {t('confirmPaySalary') || 'Xác Nhận Trả Lương'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

