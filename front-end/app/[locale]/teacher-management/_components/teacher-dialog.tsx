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
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface TeacherItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  experience: number; // years of experience
  totalClasses: number;
  dob: string; // date of birth
  idCard: string; // ID card number
  joinedDate: string;
}

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherItem | null;
  onSave: (teacher: Partial<TeacherItem>) => void;
}

export function TeacherDialog({ open, onOpenChange, teacher, onSave }: TeacherDialogProps) {
  const t = useTranslations('teacher-management');

  const [formData, setFormData] = useState<Partial<TeacherItem>>({
    name: '',
    email: '',
    phone: '',
    salary: 0,
    experience: 0,
    dob: '',
    idCard: '',
    joinedDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (teacher) {
      setFormData(teacher);
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        salary: 0,
        experience: 0,
        dob: '',
        idCard: '',
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [teacher, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof TeacherItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {teacher ? t('editTeacher') : t('addNewTeacher')}
          </DialogTitle>
          <DialogDescription>
            {teacher ? t('editTeacherDescription') : t('addTeacherDescription')}
          </DialogDescription>
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

            {/* Salary */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-right">
                {t('salary')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => handleChange('salary', Number(e.target.value))}
                className="col-span-3"
                placeholder={t('salaryPlaceholder')}
                min="0"
                required
              />
            </div>

            {/* Experience */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="experience" className="text-right">
                {t('experience')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                id="experience"
                type="number"
                value={formData.experience}
                onChange={(e) => handleChange('experience', Number(e.target.value))}
                className="col-span-3"
                placeholder={t('experiencePlaceholder')}
                min="0"
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

