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
import { TeacherRequest, TeacherType } from '@/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherType | null;
  onSave: (teacher: TeacherRequest) => void;
}

export function TeacherDialog({ open, onOpenChange, teacher, onSave }: TeacherDialogProps) {
  const t = useTranslations('teacher-management');

  const [formData, setFormData] = useState<Partial<TeacherType>>({
    fullName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    // salary: 0,
    // experience: 0,
    dob: '',
    idCard: '',
  });

  useEffect(() => {
    if (teacher) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        ...teacher,
        dob: new Date(teacher.dob).toISOString().split('T')[0],
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        gender: '',
        // salary: 0,
        // experience: 0,
        dob: '',
        idCard: '',
      });
    }
  }, [teacher, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as TeacherRequest);
  };

  const handleChange = (field: keyof TeacherType, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{teacher ? t('editTeacher') : t('addNewTeacher')}</DialogTitle>
          <DialogDescription>{teacher ? t('editTeacherDescription') : t('addTeacherDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                id="name"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
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
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                className="col-span-3"
                placeholder={t('phonePlaceholder')}
                required
              />
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
              <div className="col-span-3">
                <Select value={String(formData.gender ?? '')} onValueChange={(val) => handleChange('gender', val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('selectGender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">{t('male')}</SelectItem>
                    <SelectItem value="FEMALE">{t('female')}</SelectItem>
                    <SelectItem value="OTHER">{t('other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-right">
                {t('salary')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <div className="flex items-center gap-2 col-span-3">
                <CurrencyInputField
                  id="salary"
                  value={9999999}
                  onChange={() => {}}
                  className="flex-1"
                  placeholder="5,000,000"
                  min="0"
                  required
                />
                <p className="text-xs text-muted-foreground">VNĐ</p>
              </div>
            </div>

            {/* Experience */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right">
                {t('experience')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                id="experience"
                type="number"
                value={999}
                onChange={() => {}}
                className="col-span-3"
                placeholder={t('experiencePlaceholder')}
                min="0"
                required
              />
            </div>

            {/* Joined Date */}
            {/* <div className="grid grid-cols-4 items-center gap-4">
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
            </div> */}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">{teacher ? t('update') : t('addNew')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
