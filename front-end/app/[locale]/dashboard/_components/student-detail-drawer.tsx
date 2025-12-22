import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet';
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  User,
  Users,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface OverduePayment {
  id: number;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  studentGender?: string;
  studentBirthDate?: string;
  startDate?: string;
  className: string;
  amountDue: number;
  dueDate: string;
  daysOverdue: number;
  contacted: boolean;
  parentName?: string;
  parentPhone?: string;
}

interface StudentDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  student: OverduePayment | null;
  formatCurrency: (amount: number) => string;
}

export function StudentDetailDrawer({ isOpen, onClose, student, formatCurrency }: StudentDetailDrawerProps) {
  const t = useTranslations('dashboard');

  if (!student) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-slate-900 px-5">
        <>
          {/* Simple Header */}
          <div className="bg-white dark:bg-slate-800 -m-6 mb-4 p-6 border-b border-slate-200 dark:border-slate-700">
            <SheetTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50 my-4 text-center text-nowrap">
              {t('studentDetails')}
            </SheetTitle>

            <Separator className="mb-4" />

            {/* Student Basic Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center shrink-0">
                <User className="size-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 truncate">
                  {student.studentName}
                </h3>
                <SheetDescription className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 truncate">
                  ID: #{student.id} • {student.className}
                </SheetDescription>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-3">
            {/* Student Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">{t('studentInfo')}</h3>
              <div className="space-y-2">
                {student.studentPhone && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="size-4" />
                      <span className="text-sm">{t('studentPhone')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {student.studentPhone}
                    </span>
                  </div>
                )}
                {student.studentEmail && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 gap-2">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 shrink-0">
                      <Mail className="size-4" />
                      <span className="text-sm">{t('studentEmail')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                      {student.studentEmail}
                    </span>
                  </div>
                )}
                {student.studentGender && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <User className="size-4" />
                      <span className="text-sm">{t('studentGender')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {t(student.studentGender.toLowerCase())}
                    </span>
                  </div>
                )}
                {student.studentBirthDate && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="size-4" />
                      <span className="text-sm">{t('studentBirthDate')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {new Date(student.studentBirthDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
                {student.startDate && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Calendar className="size-4" />
                      <span className="text-sm">{t('startDate')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {new Date(student.startDate).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Class Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">{t('classInfo')}</h3>
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <BookOpen className="size-4" />
                  <span className="text-sm">{t('class')}</span>
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate ml-2">
                  {student.className}
                </span>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">{t('contactInfo')}</h3>
              <div className="space-y-2">
                {student.parentName && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Users className="size-4" />
                      <span className="text-sm">{t('parentName')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{student.parentName}</span>
                  </div>
                )}
                {student.parentPhone && (
                  <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="size-4" />
                      <span className="text-sm">{t('parentPhone')}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {student.parentPhone}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('contactStatus')}</span>
                  <Badge
                    variant={student.contacted ? 'default' : 'secondary'}
                    className={`gap-1.5 ${
                      student.contacted
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                    }`}
                  >
                    {student.contacted ? (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        {t('contacted')}
                      </>
                    ) : (
                      <>
                        <XCircle className="size-3.5" />
                        {t('notContacted')}
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 border-red-500">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="size-4" />
                {t('paymentInfo')}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 bg-red-50 dark:bg-red-900/20 -mx-4 px-4 rounded">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{t('amountDue')}</span>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(student.amountDue)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="size-4" />
                    <span className="text-sm">{t('dueDate')}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {student.dueDate
                      ? new Date(student.dueDate).toLocaleDateString('vi-VN', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="size-4" />
                    <span className="text-sm">{t('daysOverdue')}</span>
                  </div>
                  <Badge
                    variant={
                      student.daysOverdue > 30 ? 'destructive' : student.daysOverdue > 14 ? 'warning' : 'secondary'
                    }
                    className="font-semibold"
                  >
                    {student.daysOverdue} {t('days')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <Button className="w-full gap-2 h-10 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                <Mail className="size-4" />
                {t('sendReminder')}
              </Button>
              {!student.contacted && (
                <Button className="w-full gap-2 h-10 font-medium rounded-lg" variant="outline">
                  <CheckCircle2 className="size-4" />
                  {t('markAsContacted')}
                </Button>
              )}
              <Button className="w-full h-10 font-medium rounded-lg" variant="ghost" onClick={onClose}>
                {t('close')}
              </Button>
            </div>
          </div>
        </>
      </SheetContent>
    </Sheet>
  );
}
