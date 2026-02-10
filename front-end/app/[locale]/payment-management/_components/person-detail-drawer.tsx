'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PersonDetail } from '@/types/payment-type';

interface PersonDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  person: PersonDetail | null;
}

export function PersonDetailDrawer({
  isOpen,
  onClose,
  person,
}: PersonDetailDrawerProps) {
  const t = useTranslations('payment-management');

  if (!person) return null;

  const isStudent = person.type === 'student';

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 px-5">
        <>
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 -m-6 mb-4 p-6 border-b border-slate-200 dark:border-slate-700">
            <SheetTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50 my-4 text-center">
              {isStudent ? t('personDetailTitle_student') : t('personDetailTitle_teacher')}
            </SheetTitle>

            <Separator className="mb-4" />

            {/* Person Basic Info */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                isStudent 
                  ? "bg-blue-100 dark:bg-blue-900/30" 
                  : "bg-purple-100 dark:bg-purple-900/30"
              )}>
                {isStudent ? (
                  <User className="size-6 text-blue-600 dark:text-blue-400" />
                ) : (
                  <GraduationCap className="size-6 text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 truncate">
                  {person.name}
                </h3>
                <SheetDescription className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                  {isStudent ? t('studentRole') : t('teacherRole')}
                  {person.className && ` • ${person.className}`}
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-3">
            {/* Personal Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
                {t('personalInfo')}
              </h3>
              <div className="space-y-2">
                {person.phone && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="size-4" />
                      <span className="text-sm">{t('phoneNumber')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {person.phone}
                    </span>
                  </div>
                )}
                {person.email && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 shrink-0">
                      <Mail className="size-4" />
                      <span className="text-sm">Email</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {person.email}
                    </span>
                  </div>
                )}
                {person.birthDate && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="size-4" />
                      <span className="text-sm">{t('birthDate')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {new Date(person.birthDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {person.startDate && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="size-4" />
                      <span className="text-sm">{t('startDateLabel')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {new Date(person.startDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Class/Subject Information */}
            {(person.className || person.subject) && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
                  {isStudent ? t('classInfoTitle_student') : t('classInfoTitle_teacher')}
                </h3>
                <div className="space-y-2">
                  {person.className && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <BookOpen className="size-4" />
                        <span className="text-sm">{t('classLabel')}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {person.className}
                      </span>
                    </div>
                  )}
                  {person.subject && (
                    <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <GraduationCap className="size-4" />
                        <span className="text-sm">{t('subjectLabel')}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {person.subject}
                      </span>
                    </div>
                  )}
                  {person.experience && (
                    <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <GraduationCap className="size-4" />
                        <span className="text-sm">{t('experienceLabel')}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {person.experience}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Parent Information (for students) */}
            {isStudent && (person.parentName || person.parentPhone) && (
              <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
                  {t('parentInfoTitle')}
                </h3>
                <div className="space-y-2">
                  {person.parentName && (
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Users className="size-4" />
                        <span className="text-sm">{t('parentNameLabel')}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {person.parentName}
                      </span>
                    </div>
                  )}
                  {person.parentPhone && (
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="size-4" />
                        <span className="text-sm">{t('parentPhoneLabel')}</span>
                      </div>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {person.parentPhone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button className="w-full h-10 font-medium rounded-lg" variant="outline" onClick={onClose}>
                {t('close')}
              </Button>
            </div>
          </div>
        </>
      </SheetContent>
    </Sheet>
  );
}
