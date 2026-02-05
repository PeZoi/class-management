'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/helper';
import { Calendar, CheckCircle2, Clock, Package, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Attendance } from '@/types';

interface StudentAttendanceSessionsProps {
  attendances: Attendance[];
  currentPackageNumber?: number;
  currentPackageStartSession?: number;
  currentPackageEndSession?: number;
}

export function StudentAttendanceSessions({
  attendances,
  currentPackageNumber,
  currentPackageStartSession,
  currentPackageEndSession,
}: StudentAttendanceSessionsProps) {
  const t = useTranslations('student-detail');

  // Sort by session number
  const sortedAttendances = [...attendances].sort((a, b) => a.sessionNumber - b.sessionNumber);

  // Calculate progress for current package
  const currentPackageSessions = sortedAttendances.filter(
    (a) =>
      currentPackageStartSession &&
      currentPackageEndSession &&
      a.sessionNumber >= currentPackageStartSession &&
      a.sessionNumber <= currentPackageEndSession
  );
  const currentPackageProgress =
    currentPackageStartSession && currentPackageEndSession
      ? ((currentPackageSessions.length / 8) * 100).toFixed(0)
      : '0';

  const getStatusBadge = (status: Attendance['status']) => {
    const variants: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
      PRESENT: {
        label: t('attendancePresent'),
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      ABSENT: {
        label: t('attendanceAbsent'),
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      LATE: {
        label: t('attendanceLate'),
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      EXCUSED: {
        label: t('attendanceExcused'),
        icon: CheckCircle2,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
    };
    const variant = variants[status] || variants.PRESENT;
    const Icon = variant.icon;
    return (
      <Badge className={variant.className} variant="outline">
        <Icon className="size-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
            {t('attendanceSessions')}
          </CardTitle>
          {currentPackageNumber && (
            <div className="flex items-center gap-2 text-sm">
              <Package className="size-4 text-indigo-600" />
              <span className="text-slate-600 dark:text-slate-400">
                {t('packageLabel')} {currentPackageNumber}: {currentPackageSessions.length}/8 {t('sessions')}
              </span>
              <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
                  style={{ width: `${currentPackageProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sortedAttendances.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="size-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {t('noAttendanceRecords')}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedAttendances.map((attendance) => {
              const isInCurrentPackage =
                currentPackageStartSession &&
                currentPackageEndSession &&
                attendance.sessionNumber >= currentPackageStartSession &&
                attendance.sessionNumber <= currentPackageEndSession;

              return (
                <div
                  key={attendance.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isInCurrentPackage
                      ? 'border-indigo-300 dark:border-indigo-700 bg-linear-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center size-10 rounded-full bg-slate-100 dark:bg-slate-700 font-bold text-slate-900 dark:text-slate-100">
                        {attendance.sessionNumber}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100">
                          {t('sessionLabel')} {attendance.sessionNumber}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <Calendar className="size-3" />
                          {formatDate(attendance.sessionDate)}
                        </div>
                        {attendance.notes && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                            {attendance.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>{getStatusBadge(attendance.status)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

