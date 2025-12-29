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
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { PaymentItem } from '../payment-management';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: PaymentItem | null;
  onSave: (payment: Partial<PaymentItem>) => void;
}

export function PaymentDialog({ open, onOpenChange, payment, onSave }: PaymentDialogProps) {
  const t = useTranslations('payment-management');
  const isEdit = !!payment;

  const [formData, setFormData] = useState<Partial<PaymentItem>>({
    invoiceId: '',
    studentName: '',
    className: '',
    totalAmount: 0,
    paidAmount: 0,
    createdDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentMethod: 'cash',
    status: 'unpaid',
    notes: '',
  });

  useEffect(() => {
    if (payment) {
      setFormData(payment);
    } else {
      // Generate invoice ID for new payment
      const timestamp = Date.now().toString().slice(-6);
      setFormData({
        invoiceId: `INV${timestamp}`,
        studentName: '',
        className: '',
        totalAmount: 0,
        paidAmount: 0,
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        paymentMethod: 'cash',
        status: 'unpaid',
        notes: '',
      });
    }
  }, [payment, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine status based on payment amounts
    let status: PaymentItem['status'] = 'unpaid';
    if (formData.paidAmount && formData.totalAmount) {
      if (formData.paidAmount >= formData.totalAmount) {
        status = 'paid';
      } else if (formData.paidAmount > 0) {
        status = 'partial';
      }
    }

    onSave({
      ...formData,
      status,
    });
  };

  const handleChange = (field: keyof PaymentItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('editPayment') : t('addNewPayment')}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t('editPaymentDescription') : t('addPaymentDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Invoice Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t('invoiceInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceId">
                    {t('invoiceId')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="invoiceId"
                    value={formData.invoiceId}
                    onChange={(e) => handleChange('invoiceId', e.target.value)}
                    placeholder={t('invoiceIdPlaceholder')}
                    required
                    disabled={isEdit}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="createdDate">
                    {t('createdDate')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="createdDate"
                    type="date"
                    value={formData.createdDate}
                    onChange={(e) => handleChange('createdDate', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Student & Class Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t('studentClassInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">
                    {t('studentName')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleChange('studentName', e.target.value)}
                    placeholder={t('studentNamePlaceholder')}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="className">
                    {t('className')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="className"
                    value={formData.className}
                    onChange={(e) => handleChange('className', e.target.value)}
                    placeholder={t('classNamePlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t('paymentInfo')}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">
                    {t('totalAmount')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={(e) => handleChange('totalAmount', parseFloat(e.target.value) || 0)}
                    placeholder={t('totalAmountPlaceholder')}
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paidAmount">
                    {t('paidAmount')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="paidAmount"
                    type="number"
                    value={formData.paidAmount}
                    onChange={(e) => handleChange('paidAmount', parseFloat(e.target.value) || 0)}
                    placeholder={t('paidAmountPlaceholder')}
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">
                    {t('dueDate')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleChange('dueDate', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">
                    {t('paymentMethod')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => handleChange('paymentMethod', value)}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder={t('paymentMethodPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">{t('method_cash')}</SelectItem>
                      <SelectItem value="bank_transfer">{t('method_bank_transfer')}</SelectItem>
                      <SelectItem value="credit_card">{t('method_credit_card')}</SelectItem>
                      <SelectItem value="e_wallet">{t('method_e_wallet')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">{t('notes')}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder={t('notesPlaceholder')}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">{isEdit ? t('update') : t('addNew')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

