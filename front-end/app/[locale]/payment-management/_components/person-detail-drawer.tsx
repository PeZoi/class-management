'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  GraduationCap,
  Mail,
  Phone,
  User,
  Users,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PaymentItem } from '../payment-management';

interface PersonDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  person: {
    name: string;
    type: 'student' | 'teacher';
    id?: string;
    phone?: string;
    email?: string;
    gender?: string;
    birthDate?: string;
    startDate?: string;
    className?: string;
    // For students
    parentName?: string;
    parentPhone?: string;
    // For teachers
    subject?: string;
    experience?: string;
  } | null;
  relatedPayments: PaymentItem[];
  formatCurrency: (amount: number) => string;
}

export function PersonDetailDrawer({
  isOpen,
  onClose,
  person,
  relatedPayments,
  formatCurrency,
}: PersonDetailDrawerProps) {
  const t = useTranslations('payment-management');

  if (!person) return null;

  const isStudent = person.type === 'student';
  const totalPaid = relatedPayments.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalAmount = relatedPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  const remainingAmount = totalAmount - totalPaid;
  const completedPayments = relatedPayments.filter((p) => p.status === 'paid').length;
  const partialPayments = relatedPayments.filter((p) => p.status === 'partial').length;

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

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
            {/* Payment Summary */}
            <div className={cn(
              "rounded-lg p-4 border-l-4",
              isStudent 
                ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                : "bg-red-50 dark:bg-red-900/20 border-red-500"
            )}>
              <h3 className={cn(
                "text-sm font-semibold mb-3 flex items-center gap-2",
                isStudent 
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-700 dark:text-red-400"
              )}>
                <CreditCard className="size-4" />
                {isStudent ? t('paymentSummaryTitle_student') : t('paymentSummaryTitle_teacher')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('totalInvoices')}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {relatedPayments.length} {t('invoicesCount')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('totalPaid')}</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totalPaid)}
                  </span>
                </div>
                {remainingAmount > 0 && (
                  <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-slate-400">{t('remaining')}</span>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {formatCurrency(remainingAmount)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('totalSum')}</span>
                  <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="size-3 mr-1" />
                    {completedPayments} {t('completed')}
                  </Badge>
                  {partialPayments > 0 && (
                    <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      <Clock className="size-3 mr-1" />
                      {partialPayments} {t('incomplete')}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

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
                        <Clock className="size-4" />
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

            {/* Payment History */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3 flex items-center gap-2">
                <FileText className="size-4" />
                {t('paymentHistoryTitle')} ({relatedPayments.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {relatedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      payment.status === 'paid'
                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                        : 'bg-orange-50/50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-mono text-xs font-medium text-slate-600 dark:text-slate-400">
                          #{payment.invoiceId}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
                          {formatDateTime(payment.createdDate)}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          'text-xs',
                          payment.status === 'paid'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        )}
                      >
                        {payment.status === 'paid' ? (
                          <>
                            <CheckCircle className="size-3 mr-1" />
                            {t('status_completed')}
                          </>
                        ) : (
                          <>
                            <Clock className="size-3 mr-1" />
                            {t('status_incomplete')}
                          </>
                        )}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">{t('totalAmountLabel')}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {formatCurrency(payment.totalAmount)}
                        </span>
                      </div>
                      {payment.status === 'partial' && (
                        <>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600 dark:text-green-400">{t('paidLabel')}</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(payment.paidAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-orange-600 dark:text-orange-400">{t('remainingLabel')}</span>
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                              {formatCurrency(payment.totalAmount - payment.paidAmount)}
                            </span>
                          </div>
                        </>
                      )}
                      {payment.notes && (
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                          {payment.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

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
