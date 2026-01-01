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
import { TeacherType } from '@/types';
import { formatCurrency } from '@/utils/helper';
import { Briefcase, CreditCard, DollarSign, FileText, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface SalaryPaymentData {
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  paymentDate: string;
  period: string;
  notes: string;
}

interface SalaryPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherType | null;
  onConfirm: (teacherId: string, paymentData: SalaryPaymentData) => void;
}

export function SalaryPaymentDialog({ open, onOpenChange, teacher, onConfirm }: SalaryPaymentDialogProps) {
  const t = useTranslations('payment-management');

  const [formData, setFormData] = useState<SalaryPaymentData>({
    baseSalary: 0,
    bonus: 0,
    deduction: 0,
    totalAmount: 0,
    paymentMethod: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    period: '',
    notes: '',
  });

  useEffect(() => {
    if (teacher && open) {
      const currentMonth = new Date().toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric',
      });

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        baseSalary: 9999999,
        bonus: 0,
        deduction: 0,
        totalAmount: 9999999,
        paymentMethod: 'bank_transfer',
        paymentDate: new Date().toISOString().split('T')[0],
        period: `Tháng ${currentMonth}`,
        notes: '',
      });
    }
  }, [teacher, open]);

  // Auto calculate total amount
  useEffect(() => {
    const total = formData.baseSalary + formData.bonus - formData.deduction;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [formData.baseSalary, formData.bonus, formData.deduction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teacher) {
      onConfirm(teacher.id, formData);
      onOpenChange(false);
    }
  };

  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Briefcase className="size-6 text-blue-600" />
            {t('paySalaryTitle')}
          </DialogTitle>
          <DialogDescription>{t('paySalaryDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Teacher Info */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 p-4 space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <User className="size-4" />
                {t('teacherInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Họ tên:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{teacher.fullName}</div>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{teacher.email}</div>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>
                  <div className="font-medium text-slate-900 dark:text-slate-100">{teacher.phoneNumber}</div>
                </div>
                <div>
                  <span className="text-slate-500">Lương cơ bản:</span>
                  <div className="font-bold text-lg text-blue-600 dark:text-blue-400">{formatCurrency(9999999)}</div>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="size-4" />
                Thông Tin Lương
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="period">
                    {t('paymentPeriod')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="period"
                    value={formData.period}
                    onChange={(e) => setFormData((prev) => ({ ...prev, period: e.target.value }))}
                    placeholder={t('periodPlaceholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentDate">
                    Ngày Trả Lương <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="paymentDate"
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, paymentDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="baseSalary">
                    {t('baseSalary')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, baseSalary: parseFloat(e.target.value) || 0 }))}
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bonus">{t('bonus')}</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bonus: parseFloat(e.target.value) || 0 }))}
                    placeholder={t('bonusPlaceholder')}
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deduction">{t('deduction')}</Label>
                  <Input
                    id="deduction"
                    type="number"
                    value={formData.deduction}
                    onChange={(e) => setFormData((prev) => ({ ...prev, deduction: parseFloat(e.target.value) || 0 }))}
                    placeholder={t('deductionPlaceholder')}
                    min="0"
                    step="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    {t('paymentMethod')} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value: any) => setFormData((prev) => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {t('method_cash')}
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {t('method_bank_transfer')}
                        </div>
                      </SelectItem>
                      <SelectItem value="credit_card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {t('method_credit_card')}
                        </div>
                      </SelectItem>
                      <SelectItem value="e_wallet">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4" />
                          {t('method_e_wallet')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t('notes')}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('salaryNotes')}
                  rows={3}
                />
              </div>
            </div>

            {/* Salary Summary */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800 p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600 dark:text-slate-400">{t('baseSalary')}:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(formData.baseSalary)}
                  </span>
                </div>
                {formData.bonus > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600 dark:text-green-400">{t('bonus')}:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      +{formatCurrency(formData.bonus)}
                    </span>
                  </div>
                )}
                {formData.deduction > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-red-600 dark:text-red-400">{t('deduction')}:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      -{formatCurrency(formData.deduction)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-blue-200 dark:border-blue-800">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{t('totalSalary')}:</span>
                  <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                    {formatCurrency(formData.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              <DollarSign className="size-4 mr-2" />
              Xác Nhận Trả Lương
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
