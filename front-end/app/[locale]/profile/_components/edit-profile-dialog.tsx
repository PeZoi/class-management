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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Profile, UpdateProfileRequest, Gender } from '@/types';
import { Eye, EyeOff } from 'lucide-react';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onSave: (data: UpdateProfileRequest) => Promise<void>;
  fieldErrors?: FieldErrors;
}

interface FieldErrors {
  email?: string;
  phoneNumber?: string;
  idCard?: string;
  currentPassword?: string;
  password?: string;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  onSave,
  fieldErrors: externalFieldErrors = {},
}: EditProfileDialogProps) {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    fullName: profile.fullName,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
    idCard: profile.idCard,
    dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : null,
    gender: profile.gender,
    currentPassword: '',
    password: '',
  });

  // Reset form when profile changes
  // Note: setState in useEffect is necessary to sync form with props
  useEffect(() => {
    setFormData({
      fullName: profile.fullName,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
      idCard: profile.idCard,
      dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : null,
      gender: profile.gender,
      currentPassword: '',
      password: '',
    });
    // Clear errors when profile changes
    setFieldErrors({});
  }, [profile]);
  
  // Update field errors from parent
  useEffect(() => {
    setFieldErrors(externalFieldErrors);
  }, [externalFieldErrors]);
  
  // Clear errors when dialog closes
  useEffect(() => {
    if (!open) {
      setFieldErrors({});
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    
    const submitData: UpdateProfileRequest = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      idCard: formData.idCard,
      dob: formData.dob ? new Date(formData.dob).toISOString() : null,
      gender: formData.gender,
    };
    
    // Chỉ gửi password và currentPassword nếu có thay đổi
    if (formData.password && formData.password.trim() !== '') {
      submitData.currentPassword = formData.currentPassword || '';
      submitData.password = formData.password;
    }
    
    try {
      await onSave(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FieldErrors];
        return newErrors;
      });
    }
  };

  const handleGenderChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      gender: value as Gender | null,
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
                <Label htmlFor="fullName">
                  {t('name')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
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
                  className={fieldErrors.email ? 'border-red-500' : ''}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">
                  {t('phone')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder={t('phonePlaceholder')}
                  required
                  className={fieldErrors.phoneNumber ? 'border-red-500' : ''}
                />
                {fieldErrors.phoneNumber && (
                  <p className="text-sm text-red-500">{fieldErrors.phoneNumber}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">
                  {t('dob')} <span className="text-red-500">{t('required')}</span>
                </Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob || ''}
                  onChange={handleChange}
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
                  className={fieldErrors.idCard ? 'border-red-500' : ''}
                />
                {fieldErrors.idCard && (
                  <p className="text-sm text-red-500">{fieldErrors.idCard}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">
                  {t('gender')}
                </Label>
                <Select value={formData.gender || ''} onValueChange={handleGenderChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('gender')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Gender.MALE}>{t('gender_male')}</SelectItem>
                    <SelectItem value={Gender.FEMALE}>{t('gender_female')}</SelectItem>
                    <SelectItem value={Gender.OTHER}>{t('gender_other')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  {t('currentPassword')} {formData.password && formData.password.trim() !== '' && <span className="text-red-500">{t('required')}</span>}
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={handleChange}
                    placeholder={t('currentPasswordPlaceholder')}
                    required={!!(formData.password && formData.password.trim() !== '')}
                    className={fieldErrors.currentPassword ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.currentPassword && (
                  <p className="text-sm text-red-500">{fieldErrors.currentPassword}</p>
                )}
                <p className="text-xs text-muted-foreground">{t('currentPasswordHint')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  {t('newPassword')} {t('passwordOptional')}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('passwordNewPlaceholder')}
                    className={fieldErrors.password ? 'border-red-500' : ''}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
              </div>
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? tCommon('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

