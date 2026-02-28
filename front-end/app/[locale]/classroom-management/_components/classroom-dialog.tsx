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
import { useTeachersSimple } from '@/hooks/use-teachers';
import { ClassRequest, ClassType, TeacherType } from '@/types';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface ClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ClassType | null;
  onSave: (formData: ClassRequest, id?: string) => void;
  isSubmitting?: boolean;
}

export function ClassroomDialog({ open, onOpenChange, classItem, onSave, isSubmitting }: ClassroomDialogProps) {
  const t = useTranslations('classroom-management');
  const tCommon = useTranslations('common');

  const teachersQuery = useTeachersSimple({ enabled: open });
  const teachers = (teachersQuery.data ?? []) as TeacherType[];
  
  const [formData, setFormData] = useState<ClassRequest>({
    name: '',
    description: '',
    teacherId: null,
    monthlyFee: 0,
  });

  // Reset form khi dialog mở/đóng hoặc classItem thay đổi
  // Note: setState trong useEffect là cần thiết để sync form với props
  useEffect(() => {
    if (classItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: classItem.name || '',
        description: classItem.description || '',
        teacherId: classItem.teacher?.id || null,
        monthlyFee: classItem.monthlyFee || 0,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        teacherId: null,
        monthlyFee: 0,
      });
    }
  }, [classItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Chuyển empty string thành null cho teacherId
    const submitData: ClassRequest = {
      ...formData,
      teacherId: formData.teacherId && typeof formData.teacherId === 'string' && formData.teacherId.trim() !== '' 
        ? formData.teacherId 
        : null,
    };
    onSave(submitData, classItem?.id);
  };

  const handleChange = (field: keyof ClassRequest, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{classItem ? t('editClass') : t('createClass')}</DialogTitle>
          <DialogDescription>{classItem ? t('updateClass') : t('fillInfo')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Tên lớp học */}
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('className')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={t('classNamePlaceholder')}
                required
              />
            </div>

            {/* Mô tả lớp học */}
            <div className="space-y-2">
              <Label htmlFor="description">{t('classDescription')}</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('classDescriptionPlaceholder')}
              />
            </div>

            {/* Giảng viên - Select */}
            <div className="flex gap-2">
              <div className="space-y-2">
                <Label htmlFor="teacher">
                  {t('teacher')}
                </Label>
                <Select 
                  value={formData.teacherId || '__none__'} 
                  onValueChange={(value) => handleChange('teacherId', value === '__none__' ? null : value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('teacherPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__" className='text-xs italic'>{t('noTeacherOption')}</SelectItem>
                    {teachers.map((teacher: TeacherType) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName} ({teacher.gender === 'MALE' ? 'Nam' : 'Nữ'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Học phí */}
              <div className="flex-1 space-y-2">
                <Label htmlFor="monthlyFee">
                  {t('monthlyFee')} <span className="text-red-500">*</span>
                </Label>

                <div className="flex items-center gap-2 mb-2">
                  <CurrencyInputField
                    id="monthlyFee"
                    type="text"
                    value={formData.monthlyFee || 0}
                    onChange={(value) => handleChange('monthlyFee', value)}
                    className="flex-1"
                    placeholder="500,000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">VNĐ</p>
                </div>
                <p className="text-xs text-muted-foreground">{t('tuitionFeePerStudent')}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? tCommon('saving') : classItem ? t('update') : t('addNew')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
