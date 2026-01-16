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
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { StudentType, StudentRequest } from '@/types/student-type';
import { ClassType, ClassShiftType } from '@/types/class-type';
import { classService, classShiftService } from '@/services';

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: StudentType | null;
  onSave: (student: StudentRequest) => void;
}

export function StudentDialog({ open, onOpenChange, student, onSave }: StudentDialogProps) {
  const t = useTranslations('student-management');
  const tCommon = useTranslations('common');

  const [classes, setClasses] = useState<ClassType[]>([]);
  const [shifts, setShifts] = useState<ClassShiftType[]>([]);
  const [formData, setFormData] = useState<StudentRequest>({
    fullName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    gender: 'OTHER',
    fullNameParent: '',
    phoneNumberParent: '',
    classId: '',
    classShiftId: '',
  });

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await classService.getAllClasses();
        if (response.status === 200) {
          setClasses(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
      }
    };
    if (open) {
      fetchClasses();
    }
  }, [open]);

  // Reset form when dialog opens/closes or student changes
  // Note: setState in useEffect is necessary to sync form with props
  useEffect(() => {
    if (student) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        fullName: student.fullName || '',
        email: student.email || '',
        phoneNumber: student.phoneNumber || '',
        dob: new Date(student.dob).toISOString().split('T')[0],
        gender: student.gender || 'OTHER',
        fullNameParent: student.fullNameParent || '',
        phoneNumberParent: student.phoneNumberParent || '',
        classId: student.class?.id || '',
        classShiftId: student.class?.shiftId || '',
      });
    } else {
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        dob: '',
        gender: 'OTHER',
        fullNameParent: '',
        phoneNumberParent: '',
        classId: '',
        classShiftId: '',
      });
    }
  }, [student, open]);

  // Fetch shifts when classId changes
  useEffect(() => {
    const fetchShifts = async () => {
      if (!formData.classId) {
        setShifts([]);
        return;
      }
      try {
        const response = await classShiftService.getByClassId(formData.classId);
        if (response.status === 200) {
          setShifts(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching class shifts:', error);
      }
    };

    fetchShifts();
  }, [formData.classId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof StudentRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-175 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{student ? t('editStudent') : t('addNewStudent')}</DialogTitle>
          <DialogDescription>{student ? t('editStudentDescription') : t('addStudentDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Student Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('studentInfo')}</h3>
              <div className="grid gap-4">
                {/* Full Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullName" className="text-right">
                    {t('name')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="fullName"
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

                {/* Phone Number */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phoneNumber" className="text-right">
                    {t('phone')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
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
                    onValueChange={(value) => handleChange('gender', value as 'MALE' | 'FEMALE' | 'OTHER')}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('genderPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">{t('gender_male')}</SelectItem>
                      <SelectItem value="FEMALE">{t('gender_female')}</SelectItem>
                      <SelectItem value="OTHER">{t('gender_other')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('parentInfo')}</h3>
              <div className="grid gap-4">
                {/* Parent Name */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fullNameParent" className="text-right">
                    {t('parentName')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="fullNameParent"
                    value={formData.fullNameParent}
                    onChange={(e) => handleChange('fullNameParent', e.target.value)}
                    className="col-span-3"
                    placeholder={t('parentNamePlaceholder')}
                    required
                  />
                </div>

                {/* Parent Phone */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phoneNumberParent" className="text-right">
                    {t('parentPhone')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Input
                    id="phoneNumberParent"
                    value={formData.phoneNumberParent}
                    onChange={(e) => handleChange('phoneNumberParent', e.target.value)}
                    className="col-span-3"
                    placeholder={t('parentPhonePlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Class Information */}
            <div className="space-y-2 pt-4 border-t">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('classInfo')}</h3>
              <div className="grid gap-4">
                {/* Class Selection */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="classId" className="text-right">
                    {t('class')} <span className="text-red-500">{t('required')}</span>
                  </Label>
                  <Select value={formData.classId} onValueChange={(value) => handleChange('classId', value)} required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('classPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Class Shift Selection */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="classShiftId" className="text-right">
                    {t('shift')}
                  </Label>
                  <Select
                    value={formData.classShiftId || ''}
                    onValueChange={(value) => handleChange('classShiftId', value)}
                    disabled={!formData.classId || shifts.length === 0}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={shifts.length === 0 ? tCommon('noShiftForClass') : tCommon('selectShiftForClass')} />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id}>
                          {shift.name}
                        </SelectItem>
                      ))}
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
