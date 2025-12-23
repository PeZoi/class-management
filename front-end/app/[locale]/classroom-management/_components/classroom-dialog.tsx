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
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface ClassItem {
  id: number;
  name: string;
  teacher: string;
  students: number;
  revenue: number;
  schedule: string;
  duration: string;
  tuitionFee: number;
  collected: number;
  total: number;
}

interface ClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ClassItem | null;
  onSave: (classItem: ClassItem) => void;
}

export function ClassroomDialog({ open, onOpenChange, classItem, onSave }: ClassroomDialogProps) {
  const t = useTranslations('classroom-management');
  const [formData, setFormData] = useState<Partial<ClassItem>>({
    name: '',
    teacher: '',
    students: 0,
    schedule: '',
    duration: '',
    tuitionFee: 0,
    collected: 0,
    total: 0,
    revenue: 0,
  });

  useEffect(() => {
    if (classItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(classItem);
    } else {
      setFormData({
        name: '',
        teacher: '',
        students: 0,
        schedule: '',
        duration: '',
        tuitionFee: 0,
        collected: 0,
        total: 0,
        revenue: 0,
      });
    }
  }, [classItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Tính toán tự động
    const students = formData.students || 0;
    const tuitionFee = formData.tuitionFee || 0;
    const total = students * tuitionFee;
    const collected = formData.collected || 0;
    const revenue = collected;

    onSave({
      ...formData,
      total,
      revenue,
    } as ClassItem);
  };

  const handleChange = (field: keyof ClassItem, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{classItem ? t('editClass') : t('createClass')}</DialogTitle>
          <DialogDescription>{classItem ? t('updateClass') : t('fillInfo')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label htmlFor="teacher">
                  {t('teacher')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="teacher"
                  value={formData.teacher}
                  onChange={(e) => handleChange('teacher', e.target.value)}
                  placeholder={t('teacherPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="schedule">
                  {t('schedule')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => handleChange('schedule', e.target.value)}
                  placeholder={t('schedulePlaceholder')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">
                  {t('duration')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder={t('durationPlaceholder')}
                  required
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="students">
                  {t('students')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="students"
                  type="number"
                  min="0"
                  value={formData.students}
                  onChange={(e) => handleChange('students', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tuitionFee">
                  {t('tuitionFeePerStudent')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="tuitionFee"
                  type="number"
                  min="0"
                  step="100000"
                  value={formData.tuitionFee}
                  onChange={(e) => handleChange('tuitionFee', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            {/* Row 4 */}
            <div className="space-y-2">
              <Label htmlFor="collected">
                {t('collectedAmount')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                id="collected"
                type="number"
                min="0"
                step="100000"
                value={formData.collected}
                onChange={(e) => handleChange('collected', parseInt(e.target.value) || 0)}
                required
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('totalRequired')}: {((formData.students || 0) * (formData.tuitionFee || 0)).toLocaleString('vi-VN')}{' '}
                VNĐ
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button type="submit">{classItem ? t('update') : t('addNew')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
