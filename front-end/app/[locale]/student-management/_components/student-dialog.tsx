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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { StudentItem } from '../student-management-page';

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentItem | null;
  onSave: (student: Partial<StudentItem>) => void;
}

export function StudentDialog({ open, onOpenChange, student, onSave }: StudentDialogProps) {
  const t = useTranslations('student-management');

  const [formData, setFormData] = useState<Partial<StudentItem>>({
    name: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'other',
    idCard: '',
    parentName: '',
    parentPhone: '',
    className: '',
    joinedDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    paymentStatus: 'unpaid',
    tuitionFee: 0,
    amountPaid: 0,
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'other',
        idCard: '',
        parentName: '',
        parentPhone: '',
        className: '',
        joinedDate: new Date().toISOString().split('T')[0],
        status: 'pending',
        paymentStatus: 'unpaid',
        tuitionFee: 0,
        amountPaid: 0,
      });
    }
  }, [student, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof StudentItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {student ? t('editStudent') : t('addNewStudent')}
          </DialogTitle>
          <DialogDescription>
            {student ? t('editStudentDescription') : t('addStudentDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Student Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('studentInfo')}
              </h3>
              <div className="grid gap-4">
                {/* Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    {t('name')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="col-span-3"
                    placeholder={t('namePlaceholder')}
                    required
                  />
                </div>

                {/* Email */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    {t('email')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="col-span-3"
                    placeholder={t('emailPlaceholder')}
                    required
                  />
                </div>

                {/* Phone */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    {t('phone')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="col-span-3"
                    placeholder={t('phonePlaceholder')}
                    required
                  />
                </div>

                {/* Date of Birth */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">
                    {t('dob')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleChange('dob', e.target.value)}
                    className="col-span-3"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">
                    {t('gender')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleChange('gender', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('genderPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{t('gender_male')}</SelectItem>
                      <SelectItem value="female">{t('gender_female')}</SelectItem>
                      <SelectItem value="other">{t('gender_other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* ID Card */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="idCard" className="text-right">
                    {t('idCard')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="idCard"
                    value={formData.idCard}
                    onChange={(e) => handleChange('idCard', e.target.value)}
                    className="col-span-3"
                    placeholder={t('idCardPlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('parentInfo')}
              </h3>
              <div className="grid gap-4">
                {/* Parent Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parentName" className="text-right">
                    {t('parentName')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="parentName"
                    value={formData.parentName}
                    onChange={(e) => handleChange('parentName', e.target.value)}
                    className="col-span-3"
                    placeholder={t('parentNamePlaceholder')}
                    required
                  />
                </div>

                {/* Parent Phone */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parentPhone" className="text-right">
                    {t('parentPhone')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="parentPhone"
                    value={formData.parentPhone}
                    onChange={(e) => handleChange('parentPhone', e.target.value)}
                    className="col-span-3"
                    placeholder={t('parentPhonePlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Class Information */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('classInfo')}
              </h3>
              <div className="grid gap-4">
                {/* Class Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="className" className="text-right">
                    {t('class')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="className"
                    value={formData.className}
                    onChange={(e) => handleChange('className', e.target.value)}
                    className="col-span-3"
                    placeholder={t('classPlaceholder')}
                    required
                  />
                </div>

                {/* Joined Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="joinedDate" className="text-right">
                    {t('joinedDate')}
                  </Label>
                  <Input
                    id="joinedDate"
                    type="date"
                    value={formData.joinedDate}
                    onChange={(e) => handleChange('joinedDate', e.target.value)}
                    className="col-span-3"
                  />
                </div>

                {/* Status */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    {t('status')}
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('statusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">{t('status_active')}</SelectItem>
                      <SelectItem value="pending">{t('status_pending')}</SelectItem>
                      <SelectItem value="completed">{t('status_completed')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {t('paymentInfo')}
              </h3>
              <div className="grid gap-4">
                {/* Tuition Fee */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tuitionFee" className="text-right">
                    {t('tuitionFee')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="tuitionFee"
                    type="number"
                    value={formData.tuitionFee}
                    onChange={(e) => handleChange('tuitionFee', Number(e.target.value))}
                    className="col-span-3"
                    placeholder={t('tuitionFeePlaceholder')}
                    min="0"
                    required
                  />
                </div>

                {/* Amount Paid */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amountPaid" className="text-right">
                    {t('amountPaid')}
                  </Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    value={formData.amountPaid}
                    onChange={(e) => handleChange('amountPaid', Number(e.target.value))}
                    className="col-span-3"
                    placeholder={t('amountPaidPlaceholder')}
                    min="0"
                  />
                </div>

                {/* Payment Status */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentStatus" className="text-right">
                    {t('paymentStatus')}
                  </Label>
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) => handleChange('paymentStatus', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('paymentStatusPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">{t('payment_paid')}</SelectItem>
                      <SelectItem value="partial">{t('payment_partial')}</SelectItem>
                      <SelectItem value="unpaid">{t('payment_unpaid')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">{student ? t('update') : t('addNew')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

