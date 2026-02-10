'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/utils/helper';
import { Calendar, CheckCircle2, Clock, User, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { AttendanceSession } from '@/types/attendance-type';

interface StudentAttendanceProps {
  attendanceSessions: AttendanceSession[];
  currentMonth?: number;
  currentYear?: number;
  studentName?: string;
}

export function StudentAttendance({
  attendanceSessions,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear(),
  studentName,
}: StudentAttendanceProps) {
  const t = useTranslations('student-detail');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // Filter sessions by selected month/year
  const filteredSessions = attendanceSessions
    .filter((session) => {
      const sessionDate = new Date(session.date);
      return (
        sessionDate.getMonth() + 1 === selectedMonth && sessionDate.getFullYear() === selectedYear
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getStatusBadge = (status: string) => {
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
    };
    const variant = variants[status] || variants.present;
    const Icon = variant.icon;
    return (
      <Badge className={variant.className} variant="outline">
        <Icon className="size-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  // Calculate statistics
  const totalSessions = filteredSessions.length;
  const presentCount = filteredSessions.filter(
    (s) => s.status === 'present' || s.status === 'late' || s.status === 'excused'
  ).length;
  const absentCount = filteredSessions.filter((s) => s.status === 'absent').length;
  const lateCount = filteredSessions.filter((s) => s.status === 'late').length;
  const excusedCount = filteredSessions.filter((s) => s.status === 'excused').length;
  const attendanceRate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : '0';

  // Get month names
  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const monthKey = `month${i + 1}` as const;
    return t(monthKey) || `Tháng ${i + 1}`;
  });

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
            {t('attendance')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
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
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
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
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="size-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">{t('noAttendanceRecords')}</p>
          </div>
        ) : (
          <div className="min-w-[800px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 sticky left-0 bg-white dark:bg-slate-900 z-10 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <User className="size-4" />
                      {t('studentName')}
                    </div>
                  </TableHead>
                  {filteredSessions.map((session) => (
                    <TableHead
                      key={session.id}
                      className="font-semibold text-slate-700 dark:text-slate-300 text-center min-w-[140px]"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs font-medium">
                          {t('session')} {session.sessionNumber}
                        </span>
                        <span className="text-xs text-slate-500">{formatDate(session.date)}</span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center min-w-[120px]">
                    {t('attendanceRate') || 'Tỷ Lệ'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-900 z-10">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                        {studentName ? studentName.charAt(0) : 'S'}
                      </div>
                      <div>
                        <div className="font-semibold">{studentName || t('studentName')}</div>
                        <div className="text-xs text-slate-500">
                          {totalSessions} {t('totalSessions') || 'buổi'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  {filteredSessions.map((session) => (
                    <TableCell key={session.id} className="text-center">
                      <div className="flex flex-col items-center gap-2">
                        {getStatusBadge(session.status)}
                        {session.notes && (
                          <span className="text-xs text-slate-500 italic max-w-[120px] truncate" title={session.notes}>
                            {session.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{attendanceRate}%</span>
                      <span className="text-xs text-slate-500">
                        {presentCount}/{totalSessions}
                      </span>
                      <div className="mt-1 w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-green-500 to-green-600 rounded-full transition-all"
                          style={{ width: `${attendanceRate}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
