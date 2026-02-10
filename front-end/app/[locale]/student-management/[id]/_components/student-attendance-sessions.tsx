'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { formatDate } from '@/utils/helper';
import { Calendar, CheckCircle2, Clock, Package, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { Attendance } from '@/types';
import { SessionPaymentStatus } from '@/types';
import { AttendanceSession } from '@/types/attendance-type';

interface StudentAttendanceSessionsProps {
  attendances: Attendance[];
  currentPackageNumber?: number;
  currentPackageStartSession?: number;
  currentPackageEndSession?: number;
  studentName?: string;
  sessionPayments?: SessionPaymentStatus[]; // Danh sách packages để filter
}

export function StudentAttendanceSessions({
  attendances,
  currentPackageNumber,
  currentPackageStartSession,
  currentPackageEndSession,
  studentName = '',
  sessionPayments = [],
}: StudentAttendanceSessionsProps) {
  const t = useTranslations('student-detail');
  
  // State for filter mode: 'month' or 'package'
  const [filterMode, setFilterMode] = useState<'month' | 'package'>('month');
  
  // State for month/year filter, default to current month/year
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // State for package filter
  const [selectedPackageNumber, setSelectedPackageNumber] = useState<number | null>(
    currentPackageNumber || null
  );

  // Filter attendances based on filter mode
  const filteredAttendances = useMemo(() => {
    if (filterMode === 'package') {
      // Filter by package: find selected package and filter by sessionNumber range
      if (!selectedPackageNumber) return [];
      
      const selectedPackage = sessionPayments.find(
        (p) => p.packageNumber === selectedPackageNumber
      );
      
      if (!selectedPackage) return [];
      
      return attendances.filter((attendance) => {
        return (
          attendance.sessionNumber >= selectedPackage.startSessionNumber &&
          attendance.sessionNumber <= selectedPackage.endSessionNumber
        );
      });
    } else {
      // Filter by month/year
      return attendances.filter((attendance) => {
        const date = new Date(attendance.sessionDate);
        return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
      });
    }
  }, [attendances, filterMode, selectedMonth, selectedYear, selectedPackageNumber, sessionPayments]);

  // Create sessions and map attendance data
  const sessions: AttendanceSession[] = useMemo(() => {
    if (filterMode === 'package') {
      // Filter by package: use actual session numbers from package
      if (!selectedPackageNumber) return [];
      
      const selectedPackage = sessionPayments.find(
        (p) => p.packageNumber === selectedPackageNumber
      );
      
      if (!selectedPackage) return [];
      
      const startSession = selectedPackage.startSessionNumber;
      const endSession = selectedPackage.endSessionNumber;
      const totalSessions = endSession - startSession + 1;
      
      // Create a map of session number to attendance
      const attendanceMap = new Map<number, Attendance>();
      filteredAttendances.forEach((attendance) => {
        attendanceMap.set(attendance.sessionNumber, attendance);
      });
      
      // Create sessions for the package range
      return Array.from({ length: totalSessions }, (_, i) => {
        const sessionNumber = startSession + i;
        const attendance = attendanceMap.get(sessionNumber);
        
        if (attendance) {
          return {
            id: attendance.id,
            date: attendance.sessionDate.split('T')[0],
            sessionNumber,
            status: attendance.status.toLowerCase() as 'present' | 'absent' | 'late' | 'excused',
            notes: attendance.notes || undefined,
          };
        }
        
        return {
          id: `session-${sessionNumber}`,
          date: '',
          sessionNumber,
          status: 'no_data' as const,
          notes: undefined,
        };
      });
    } else {
      // Filter by month: use existing logic
      // Get unique dates from filtered attendances and sort them
      const uniqueDates = Array.from(
        new Set(filteredAttendances.map((a) => a.sessionDate.split('T')[0]))
      ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

      // Map date to session number (1-8) within the month
      const dateToSessionNumber = new Map<string, number>();
      uniqueDates.forEach((date, index) => {
        dateToSessionNumber.set(date, index + 1);
      });

      // Create a map of session number to attendance
      const attendanceMap = new Map<number, Attendance>();
      filteredAttendances.forEach((attendance) => {
        const dateStr = attendance.sessionDate.split('T')[0];
        const sessionNumber = dateToSessionNumber.get(dateStr);
        if (sessionNumber) {
          attendanceMap.set(sessionNumber, attendance);
        }
      });

      // Create 8 sessions (Buổi 1-8)
      return Array.from({ length: 8 }, (_, i) => {
        const sessionNumber = i + 1;
        const attendance = attendanceMap.get(sessionNumber);
        const date = uniqueDates[i] || '';
        
        if (attendance) {
          return {
            id: attendance.id,
            date: attendance.sessionDate.split('T')[0],
            sessionNumber,
            status: attendance.status.toLowerCase() as 'present' | 'absent' | 'late' | 'excused',
            notes: attendance.notes || undefined,
          };
        }
        
        return {
          id: `session-${sessionNumber}`,
          date,
          sessionNumber,
          status: 'no_data' as const,
          notes: undefined,
        };
      });
    }
  }, [filteredAttendances, filterMode, selectedPackageNumber, sessionPayments]);

  // Calculate progress for current package
  const currentPackageSessions = useMemo(() => {
    if (!currentPackageStartSession || !currentPackageEndSession) return [];
    return sessions.filter(
      (s) => s.sessionNumber >= currentPackageStartSession! && s.sessionNumber <= currentPackageEndSession!
    );
  }, [sessions, currentPackageStartSession, currentPackageEndSession]);

  // Calculate progress for current package (only when filtering by month)
  const currentPackageProgress =
    filterMode === 'month' && currentPackageStartSession && currentPackageEndSession
      ? ((currentPackageSessions.filter((s) => s.status !== 'no_data').length / 8) * 100).toFixed(0)
      : filterMode === 'package' && selectedPackageNumber
      ? ((sessions.filter((s) => s.status !== 'no_data').length / sessions.length) * 100).toFixed(0)
      : '0';

  // Calculate statistics
  const stats = useMemo(() => {
    const sessionsWithData = sessions.filter((s) => s.status !== 'no_data');
    const presentCount = sessions.filter(
      (s) => s.status === 'present' || s.status === 'late' || s.status === 'excused'
    ).length;
    const attendanceRate = sessionsWithData.length > 0 
      ? ((presentCount / sessionsWithData.length) * 100).toFixed(1) 
      : '0';
    return { 
      presentCount, 
      sessionsWithData: sessionsWithData.length,
      attendanceRate 
    };
  }, [sessions]);

  // Get month names from translations
  const monthNames = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthKey = `month${i + 1}` as 'month1' | 'month2' | 'month3' | 'month4' | 'month5' | 'month6' | 'month7' | 'month8' | 'month9' | 'month10' | 'month11' | 'month12';
      return t(monthKey) || `Month ${i + 1}`;
    });
  }, [t]);

  const getStatusBadge = (session: AttendanceSession) => {
    const { status, notes } = session;
    const variants: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
      present: {
        label: t('attendancePresent') || 'Có mặt',
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      absent: {
        label: t('attendanceAbsent') || 'Vắng mặt',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      late: {
        label: t('attendanceLate') || 'Đi muộn',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      excused: {
        label: t('attendanceExcused') || 'Có phép',
        icon: CheckCircle2,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      no_data: {
        label: t('attendanceNoData') || 'Chưa điểm danh',
        icon: Calendar,
        className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
      },
    };
    const variant = variants[status] || variants.no_data;
    const Icon = variant.icon;
    
    const badge = (
      <Badge className={variant.className} variant="outline">
        <Icon className="size-3 mr-1" />
        {variant.label}
      </Badge>
    );
    
    // If there's no notes, return badge without tooltip
    if (!notes) {
      return badge;
    }
    
    // Return badge with tooltip showing notes
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="space-y-1 text-sm">
            <div>
              <span className="font-medium">{t('notes') || 'Ghi chú'}:</span>{' '}
              <span>{notes}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Calendar className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
              {t('attendanceSessions')}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Filter Mode Toggle */}
              <div className="flex items-center gap-2 border rounded-lg p-1 bg-slate-50 dark:bg-slate-800">
                <button
                  onClick={() => {
                    setFilterMode('month');
                    if (currentPackageNumber) {
                      setSelectedPackageNumber(currentPackageNumber);
                    }
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    filterMode === 'month'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Calendar className="size-4 inline mr-1.5" />
                  {t('filterByMonth') || 'Theo tháng'}
                </button>
                <button
                  onClick={() => {
                    setFilterMode('package');
                    if (!selectedPackageNumber && currentPackageNumber) {
                      setSelectedPackageNumber(currentPackageNumber);
                    }
                  }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                    filterMode === 'package'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Package className="size-4 inline mr-1.5" />
                  {t('filterByPackage') || 'Theo gói'}
                </button>
              </div>

              {/* Month/Year Filter (only show when filter mode is 'month') */}
              {filterMode === 'month' && (
                <>
                  <Select
                    value={selectedMonth.toString()}
                    onValueChange={(value) => setSelectedMonth(Number(value))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {monthNames.map((month, index) => (
                        <SelectItem key={index + 1} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={selectedYear.toString()}
                    onValueChange={(value) => setSelectedYear(Number(value))}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </>
              )}

              {/* Package Filter (only show when filter mode is 'package') */}
              {filterMode === 'package' && sessionPayments.length > 0 && (
                <Select
                  value={selectedPackageNumber?.toString() || ''}
                  onValueChange={(value) => setSelectedPackageNumber(Number(value))}
                >
                  <SelectTrigger className="w-fit">
                    <SelectValue placeholder={t('selectPackage') || 'Chọn gói'} />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionPayments.map((pkg) => (
                      <SelectItem key={pkg.packageNumber} value={pkg.packageNumber.toString()}>
                        {t('packageLabel')} {pkg.packageNumber} ({pkg.startSessionNumber}-{pkg.endSessionNumber})
                        {pkg.isCurrent && (
                          <span className="ml-2 text-xs text-indigo-600 dark:text-indigo-400">
                            - {t('current')}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Progress Indicator */}
              {filterMode === 'month' && currentPackageNumber && (
                <div className="flex items-center gap-2 text-sm ml-2">
                  <Package className="size-4 text-indigo-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {t('packageLabel')} {currentPackageNumber}: {currentPackageSessions.filter((s) => s.status !== 'no_data').length}/8 {t('sessions')}
                  </span>
                  <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
                      style={{ width: `${currentPackageProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {filterMode === 'package' && selectedPackageNumber && (
                <div className="flex items-center gap-2 text-sm ml-2">
                  <Package className="size-4 text-indigo-600" />
                  <span className="text-slate-600 dark:text-slate-400">
                    {sessions.filter((s) => s.status !== 'no_data').length}/{sessions.length} {t('sessions')}
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
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[1200px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10 min-w-[200px]">
                    {t('studentName') || 'Tên Học Sinh'}
                  </TableHead>
                  {sessions.map((session) => (
                    <TableHead
                      key={session.id}
                      className="font-semibold text-slate-700 dark:text-slate-300 text-center min-w-[120px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs">{t('session') || 'Buổi'} {session.sessionNumber}</span>
                        <span className="text-xs text-slate-500">
                          {session.date ? formatDate(session.date) : '-'}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center min-w-[100px]">
                    {t('attendanceRate') || 'Tỷ Lệ'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-900 z-10">
                    {studentName || '-'}
                  </TableCell>
                  {sessions.map((session) => (
                    <TableCell key={session.id} className="text-center">
                      <div className="inline-flex">
                        {getStatusBadge(session)}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{stats.attendanceRate}%</span>
                      <span className="text-xs text-slate-500">
                        {stats.presentCount}/{stats.sessionsWithData}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

