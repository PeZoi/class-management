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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CurrencyInputField } from '@/components/currency-input-field';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { teacherService } from '@/services';
import { TeacherType } from '@/types';
import { ClassRequest } from '@/types/class-type';

interface ClassItem {
  id: number;
  name: string;
  teacher: string;
  students: number;
  revenue: number;
  schedule: string;
  duration: string;
  monthlyFee: number;
  collected: number;
  total: number;
}

interface ClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ClassItem | null;
  onSave: (formData: ClassRequest, id?: number) => void;
}

export function ClassroomDialog({ 
  open, 
  onOpenChange, 
  classItem, 
  onSave,
}: ClassroomDialogProps) {
  const t = useTranslations('classroom-management');
  
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [formData, setFormData] = useState<ClassRequest>({
    name: '',
    teacherId: '',
    schedule: '',
    monthlyFee: 0,
  });

  // Reset form khi dialog mở/đóng hoặc classItem thay đổi
  // Note: setState trong useEffect là cần thiết để sync form với props
  useEffect(() => {
    if (classItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: classItem.name || '',
        teacherId: classItem.teacher || '',
        schedule: classItem.schedule || '',
        monthlyFee: classItem.monthlyFee || 0,
      });
    } else {
      setFormData({
        name: '',
        teacherId: '',
        schedule: '',
        monthlyFee: 0,
      });
    }
  }, [classItem, open]);

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await teacherService.getAllTeachers();
        if (response.status === 200) {
          setTeachers(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Chỉ truyền formData và id (nếu đang edit)
    onSave(formData, classItem?.id);

    // Reset form và đóng dialog
    onOpenChange(false);
  };

  const handleChange = (field: keyof ClassRequest, value: string | number) => {
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

            <div className="space-y-2">
              <Label htmlFor="schedule">
                {t('schedule')} <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => handleChange('schedule', e.target.value)}
                placeholder="VD: T2, T4, T6 - 19:00"
                required
              />
            </div>

            {/* Giảng viên - Select */}
            <div className="flex gap-2">
              <div className="space-y-2">
                <Label htmlFor="teacher">
                  {t('teacher')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Select value={formData.teacherId} onValueChange={(value) => handleChange('teacherId', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('teacherPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.fullName} ({teacher.gender === "MALE" ? "Nam" : "Nữ"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Học phí */}
              <div className="flex-1">
                <CurrencyInputField
                  id="monthlyFee"
                  label={t('monthlyFee')}
                  value={formData.monthlyFee || 0}
                  onChange={(value) => handleChange('monthlyFee', value)}
                  placeholder="500,000"
                  required
                  description={t('tuitionFeePerStudent')}
                  className="flex-1"
                />
              </div>
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
