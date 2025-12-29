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

interface Teacher {
  id: number;
  name: string;
}

interface ClassroomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classItem: ClassItem | null;
  onSave: (classItem: ClassItem) => void;
  teachers?: Teacher[]; // Danh sách giáo viên
}

// Mock data giáo viên mẫu - bạn sẽ thay thế bằng data thật từ API
const MOCK_TEACHERS: Teacher[] = [
  { id: 1, name: 'Nguyễn Văn A' },
  { id: 2, name: 'Trần Thị B' },
  { id: 3, name: 'Lê Văn C' },
  { id: 4, name: 'Phạm Thị D' },
  { id: 5, name: 'Hoàng Văn E' },
];

export function ClassroomDialog({ 
  open, 
  onOpenChange, 
  classItem, 
  onSave,
  teachers = MOCK_TEACHERS 
}: ClassroomDialogProps) {
  const t = useTranslations('classroom-management');
  const [formData, setFormData] = useState<Partial<ClassItem>>({
    name: '',
    teacher: '',
    tuitionFee: 0,
  });


  useEffect(() => {
    if (classItem) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: classItem.name,
        teacher: classItem.teacher,
        tuitionFee: classItem.tuitionFee,
      });
    } else {
      setFormData({
        name: '',
        teacher: '',
        tuitionFee: 0,
      });
    }
  }, [classItem, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...classItem,
      ...formData,
      // Giữ lại các giá trị mặc định cho các field không có trong form
      students: classItem?.students || 0,
      revenue: classItem?.revenue || 0,
      schedule: classItem?.schedule || '',
      duration: classItem?.duration || '',
      collected: classItem?.collected || 0,
      total: classItem?.total || 0,
    } as ClassItem);

    // Reset form
    onOpenChange(false);
  };

  const handleChange = (field: keyof ClassItem, value: string | number) => {
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

            {/* Giảng viên - Select */}
            <div className='flex gap-2 mt-2'>
              <div className="space-y-2">
                <Label htmlFor="teacher">
                  {t('teacher')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Select
                  value={formData.teacher}
                  onValueChange={(value) => handleChange('teacher', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('teacherPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.name}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
  
              {/* Học phí */}
              <div className="flex-1">
                <CurrencyInputField
                  id="tuitionFee"
                  label={t('tuitionFee')}
                  value={formData.tuitionFee || 0}
                  onChange={(value) => handleChange('tuitionFee', value)}
                  placeholder="5,000,000"
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
