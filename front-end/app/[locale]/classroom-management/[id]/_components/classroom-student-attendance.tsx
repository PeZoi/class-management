'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StudentType } from '@/types';
import { formatDate } from '@/utils/helper';
import { Calendar, CheckCircle2, Clock, XCircle, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export interface AttendanceSession {
  id: string;
  date: string;
  sessionNumber: number; // 1-8 for each month
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string;
  notes?: string;
}

export interface StudentAttendanceRecord {
  studentId: string;
  studentName: string;
  sessions: AttendanceSession[];
}

interface ClassroomStudentAttendanceProps {
  students: StudentType[];
  currentMonth?: number; // 1-12, default to current month
  currentYear?: number; // default to current year
}

// Generate 8 sessions for a month (2 per week: typically Monday and Thursday)
const generateSessionsForMonth = (month: number, year: number): AttendanceSession[] => {
  const sessions: AttendanceSession[] = [];
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // Find the first Monday of the month (or start from 1st if it's Monday)
  const firstMonday = new Date(firstDay);
  const dayOfWeek = firstDay.getDay();
  // Convert Sunday (0) to 7 for easier calculation
  const dayOfWeekNormalized = dayOfWeek === 0 ? 7 : dayOfWeek;
  const daysToMonday = dayOfWeekNormalized === 1 ? 0 : 8 - dayOfWeekNormalized;
  firstMonday.setDate(firstDay.getDate() + daysToMonday);
  
  // Generate 8 sessions (2 per week for 4 weeks)
  for (let week = 0; week < 4 && sessions.length < 8; week++) {
    // Monday session (week * 7 days from first Monday)
    const mondayDate = new Date(firstMonday);
    mondayDate.setDate(firstMonday.getDate() + week * 7);
    if (mondayDate.getMonth() === month - 1 && mondayDate.getDate() <= daysInMonth) {
      sessions.push({
        id: `session-${sessions.length + 1}`,
        date: mondayDate.toISOString().split('T')[0],
        sessionNumber: sessions.length + 1,
        status: 'present',
        checkInTime: undefined,
        notes: undefined,
      });
    }
    
    // Thursday session (3 days after Monday)
    if (sessions.length < 8) {
      const thursdayDate = new Date(mondayDate);
      thursdayDate.setDate(mondayDate.getDate() + 3);
      if (thursdayDate.getMonth() === month - 1 && thursdayDate.getDate() <= daysInMonth) {
        sessions.push({
          id: `session-${sessions.length + 1}`,
          date: thursdayDate.toISOString().split('T')[0],
          sessionNumber: sessions.length + 1,
          status: 'present',
          checkInTime: undefined,
          notes: undefined,
        });
      }
    }
  }
  
  return sessions;
};

export function ClassroomStudentAttendance({
  students,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear(),
}: ClassroomStudentAttendanceProps) {
  const t = useTranslations('classroom-detail');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Generate sessions for the selected month
  const sessions = generateSessionsForMonth(selectedMonth, selectedYear);
  
  // Mock attendance data - in real app, this would come from API
  // For now, we'll generate some mock data based on students
  const attendanceRecords: StudentAttendanceRecord[] = students.map((student) => {
    return {
      studentId: student.id,
      studentName: student.fullName,
      sessions: sessions.map((session) => {
        // Generate mock attendance status (75% present rate)
        const random = Math.random();
        let status: 'present' | 'absent' | 'late' | 'excused' = 'present';
        if (random > 0.75) {
          status = 'absent';
        } else if (random > 0.65) {
          status = 'late';
        }
        
        return {
          ...session,
          status,
          checkInTime: status === 'present' || status === 'late' ? '19:00' : undefined,
        };
      }),
    };
  });
  
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
  const totalSessions = sessions.length;
  const calculateStudentStats = (record: StudentAttendanceRecord) => {
    const presentCount = record.sessions.filter((s) => s.status === 'present' || s.status === 'late' || s.status === 'excused').length;
    const absentCount = record.sessions.filter((s) => s.status === 'absent').length;
    const lateCount = record.sessions.filter((s) => s.status === 'late').length;
    const attendanceRate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : '0';
    return { presentCount, absentCount, lateCount, attendanceRate };
  };
  
  // Get month names from translations
  const monthNames = Array.from({ length: 12 }, (_, i) => {
    const monthKey = `month${i + 1}` as 'month1' | 'month2' | 'month3' | 'month4' | 'month5' | 'month6' | 'month7' | 'month8' | 'month9' | 'month10' | 'month11' | 'month12';
    return t(monthKey) || `Month ${i + 1}`;
  });
  
  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {t('studentAttendance') || 'Điểm Danh Học Sinh'}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Users className="size-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t('noStudentsForAttendance') || 'Chưa có học sinh để điểm danh'}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar className="size-5 md:size-6 text-blue-600 dark:text-blue-400" />
            {t('studentAttendance') || 'Điểm Danh Học Sinh'}
          </CardTitle>
          <div className="flex items-center gap-2">
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
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t('attendanceInfo', { totalSessions }) || `Tháng này có ${totalSessions} buổi học (2 buổi/tuần)`}
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
                      <span className="text-xs">{t('session')} {session.sessionNumber}</span>
                      <span className="text-xs text-slate-500">{formatDate(session.date)}</span>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center min-w-[100px]">
                  {t('attendanceRate') || 'Tỷ Lệ'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => {
                const stats = calculateStudentStats(record);
                return (
                  <TableRow
                    key={record.studentId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100 sticky left-0 bg-white dark:bg-slate-900 z-10">
                      {record.studentName}
                    </TableCell>
                    {record.sessions.map((session) => (
                      <TableCell key={session.id} className="text-center">
                        {getStatusBadge(session.status)}
                      </TableCell>
                    ))}
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{stats.attendanceRate}%</span>
                        <span className="text-xs text-slate-500">
                          {stats.presentCount}/{totalSessions}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

