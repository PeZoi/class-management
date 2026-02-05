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
import { StudentType, Attendance } from '@/types';
import { formatDate } from '@/utils/helper';
import { Calendar, CheckCircle2, Clock, XCircle, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { useAttendanceByClass } from '@/hooks/use-attendance';

export interface AttendanceSession {
  id: string;
  date: string;
  sessionNumber: number; // 1-8 for each month
  status: 'present' | 'absent' | 'late' | 'excused' | 'no_data';
  notes?: string;
}

export interface StudentAttendanceRecord {
  studentId: string;
  studentName: string;
  sessions: AttendanceSession[];
}

interface ClassroomStudentAttendanceProps {
  students: StudentType[];
  classId: string;
  currentMonth?: number; // 1-12, default to current month
  currentYear?: number; // default to current year
}

// Convert backend Attendance to AttendanceSession format
const convertToAttendanceSession = (attendance: Attendance): AttendanceSession => {
  return {
    id: attendance.id,
    date: attendance.sessionDate.split('T')[0],
    sessionNumber: attendance.sessionNumber,
    status: attendance.status.toLowerCase() as 'present' | 'absent' | 'late' | 'excused',
    notes: attendance.notes,
  };
};

export function ClassroomStudentAttendance({
  students,
  classId,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear(),
}: ClassroomStudentAttendanceProps) {
  const t = useTranslations('classroom-detail');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // Fetch attendance data from database
  const { data: attendanceData = [], isLoading } = useAttendanceByClass(classId);
  
  // Filter and process attendance data
  const { sessions, attendanceRecords } = useMemo(() => {
    // Always create 8 sessions (1-8) for the selected month
    const sessions: AttendanceSession[] = Array.from({ length: 8 }, (_, i) => ({
      id: `session-${i + 1}`,
      date: '',
      sessionNumber: i + 1,
      status: 'no_data' as const,
      notes: undefined,
    }));
    
    // Filter attendance for selected month/year
    const filteredAttendance = attendanceData.filter((attendance) => {
      const date = new Date(attendance.sessionDate);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });
    
    // Get unique session numbers and dates from actual data
    const sessionDateMap = new Map<number, string>();
    filteredAttendance.forEach((attendance) => {
      if (!sessionDateMap.has(attendance.sessionNumber)) {
        sessionDateMap.set(attendance.sessionNumber, attendance.sessionDate.split('T')[0]);
      }
    });
    
    // Update sessions with actual dates
    sessions.forEach((session) => {
      const actualDate = sessionDateMap.get(session.sessionNumber);
      if (actualDate) {
        session.date = actualDate;
      }
    });
    
    // Group attendance by student
    const studentAttendanceMap = new Map<string, Attendance[]>();
    filteredAttendance.forEach((attendance) => {
      if (!studentAttendanceMap.has(attendance.studentId)) {
        studentAttendanceMap.set(attendance.studentId, []);
      }
      studentAttendanceMap.get(attendance.studentId)!.push(attendance);
    });
    
    // Create attendance records for each student
    const attendanceRecords: StudentAttendanceRecord[] = students.map((student) => {
      const studentAttendances = studentAttendanceMap.get(student.id) || [];
      const attendanceBySession = new Map(
        studentAttendances.map((a) => [a.sessionNumber, convertToAttendanceSession(a)])
      );
      
      return {
        studentId: student.id,
        studentName: student.fullName,
        sessions: sessions.map((session) => {
          const attendance = attendanceBySession.get(session.sessionNumber);
          // Use actual attendance or show "no_data" status
          return attendance || { ...session, status: 'no_data' as const };
        }),
      };
    });
    
    return { sessions, attendanceRecords };
  }, [attendanceData, selectedMonth, selectedYear, students]);
  
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
  
  // Calculate statistics
  const calculateStudentStats = (record: StudentAttendanceRecord) => {
    const sessionsWithData = record.sessions.filter((s) => s.status !== 'no_data');
    const presentCount = record.sessions.filter((s) => s.status === 'present' || s.status === 'late' || s.status === 'excused').length;
    const absentCount = record.sessions.filter((s) => s.status === 'absent').length;
    const lateCount = record.sessions.filter((s) => s.status === 'late').length;
    const attendanceRate = sessionsWithData.length > 0 ? ((presentCount / sessionsWithData.length) * 100).toFixed(1) : '0';
    return { presentCount, absentCount, lateCount, attendanceRate, sessionsWithData: sessionsWithData.length };
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
            {t('noStudentsForAttendance')}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {t('studentAttendance') || 'Điểm Danh Học Sinh'}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <div className="text-slate-600 dark:text-slate-400">
            {t('loadingAttendance') || 'Đang tải dữ liệu điểm danh...'}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  
  return (
    <TooltipProvider>
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
            {t('attendanceInfo', { totalSessions: 8 })}
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
                        {getStatusBadge(session)}
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
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}

