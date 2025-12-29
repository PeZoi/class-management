'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  idCard: string;
  experience: number;
  baseSalary: number;
  joinedDate: string;
  address: string;
  bio: string;
  avatar?: string;
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  totalEarnings: number;
  monthlyEarnings: number;
}

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: TeacherProfile;
  onSave: (data: Partial<TeacherProfile>) => void;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  teacher,
  onSave,
}: EditProfileDialogProps) {
  const t = useTranslations('profile');
  const [formData, setFormData] = useState({
    name: teacher.name,
    email: teacher.email,
    phone: teacher.phone,
    dob: teacher.dob,
    idCard: teacher.idCard,
    experience: teacher.experience,
    baseSalary: teacher.baseSalary,
    address: teacher.address,
    bio: teacher.bio,
  });

  useEffect(() => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      dob: teacher.dob,
      idCard: teacher.idCard,
      experience: teacher.experience,
      baseSalary: teacher.baseSalary,
      address: teacher.address,
      bio: teacher.bio,
    });
  }, [teacher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience' || name === 'baseSalary' ? Number(value) : value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('updateProfile')}</DialogTitle>
          <DialogDescription>{t('updateProfileDescription')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('personalInfo')}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  {t('name')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('namePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('email')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  {t('phone')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t('phonePlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">
                  {t('dob')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="idCard">
                  {t('idCard')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="idCard"
                  name="idCard"
                  value={formData.idCard}
                  onChange={handleChange}
                  placeholder={t('idCardPlaceholder')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">
                  {t('experience')} ({t('years')})
                </Label>
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  min="0"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder={t('experiencePlaceholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">
                {t('address')}
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={t('addressPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">
                {t('bio')}
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder={t('bioPlaceholder')}
                rows={4}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('teachingStats')}</h3>
            
            <div className="space-y-2">
              <Label htmlFor="baseSalary">
                {t('baseSalary')} (VNĐ) <span className="text-red-500">{t('required')}</span>
              </Label>
              <Input
                id="baseSalary"
                name="baseSalary"
                type="number"
                min="0"
                step="100000"
                value={formData.baseSalary}
                onChange={handleChange}
                placeholder={t('salaryPlaceholder')}
                required
              />
              <p className="text-xs text-muted-foreground">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(formData.baseSalary)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('cancel')}
            </Button>
            <Button type="submit">{t('save')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

