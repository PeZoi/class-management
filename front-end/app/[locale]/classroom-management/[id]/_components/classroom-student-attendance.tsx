'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Attendance, AttendanceStatus, StudentType } from '@/types';
import { ClassShiftType } from '@/types/class-type';
import { formatDate } from '@/utils/helper';
import { AlertCircle, Calendar, CheckCircle2, Clock, Save, XCircle, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import { useAttendanceByClass, useCreateAttendance, useUpdateAttendance } from '@/hooks/use-attendance';
import { toast } from 'react-toastify';

export interface AttendanceSession {
  id: string;
  date: string;
  sessionNumber: number; // 1..N within selected month
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
  shifts?: ClassShiftType[]; // Danh sách ca học để lọc
}

export function ClassroomStudentAttendance({
  students,
  classId,
  currentMonth = new Date().getMonth() + 1,
  currentYear = new Date().getFullYear(),
  shifts = [],
}: ClassroomStudentAttendanceProps) {
  const t = useTranslations('classroom-detail');
  const tAttendance = useTranslations('attendance');
  const tCommon = useTranslations('common');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [filterShift, setFilterShift] = useState<string>('all');

  const [editOpen, setEditOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<StudentType | null>(null);
  const [editSession, setEditSession] = useState<AttendanceSession | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus | ''>('');
  const [editNotes, setEditNotes] = useState<string>('');

  const createAttendance = useCreateAttendance();
  const updateAttendance = useUpdateAttendance();
  
  // Fetch attendance data from database
  const { data: attendanceData = [], isLoading } = useAttendanceByClass(classId);
  
  // Map student ID to shift ID
  const studentShiftMap = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((student) => {
      if (student.class?.shiftId) {
        map.set(student.id, student.class.shiftId);
      }
    });
    return map;
  }, [students]);
  
  // Filter and process attendance data
  const { sessions, attendanceRecords } = useMemo(() => {
    // Filter attendance for selected month/year
    const filteredAttendance = attendanceData.filter((attendance) => {
      const date = new Date(attendance.sessionDate);
      return date.getMonth() + 1 === selectedMonth && date.getFullYear() === selectedYear;
    });

    // Lấy danh sách ngày học duy nhất trong tháng này (theo thứ tự tăng dần)
    const uniqueDates = Array.from(
      new Set(
        filteredAttendance.map((a) => a.sessionDate.split('T')[0])
      )
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Số buổi hiển thị: tối thiểu 8, nếu tháng đó có >8 buổi thì tăng theo số ngày thực tế
    const totalSessions = Math.max(8, uniqueDates.length);

    // Map từ date -> số buổi trong tháng (1..N)
    const dateToSessionNumber = new Map<string, number>();
    uniqueDates.forEach((date, index) => {
      dateToSessionNumber.set(date, index + 1);
    });

    // Tạo danh sách sessions 1..totalSessions, gán ngày cho các buổi có dữ liệu
    const sessions: AttendanceSession[] = Array.from({ length: totalSessions }, (_, i) => {
      const date = uniqueDates[i] ?? '';
      return {
        id: date ? `session-${i + 1}-${date}` : `session-${i + 1}`,
        date,
        sessionNumber: i + 1,
        status: 'no_data' as const,
        notes: undefined,
      };
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
    let allAttendanceRecords: StudentAttendanceRecord[] = students.map((student) => {
      const studentAttendances = studentAttendanceMap.get(student.id) || [];
      const attendanceBySession = new Map<number, AttendanceSession>();

      studentAttendances.forEach((a) => {
        const dateStr = a.sessionDate.split('T')[0];
        const sessionNumber = dateToSessionNumber.get(dateStr);
        if (!sessionNumber) return;

        attendanceBySession.set(sessionNumber, {
          id: a.id,
          date: dateStr,
          sessionNumber,
          status: a.status.toLowerCase() as 'present' | 'absent' | 'late' | 'excused',
          notes: a.notes || undefined,
        });
      });

      return {
        studentId: student.id,
        studentName: student.fullName,
        sessions: sessions.map((session) => {
          const attendance = attendanceBySession.get(session.sessionNumber);
          // Use actual attendance or show "no_data" status
          return attendance || session;
        }),
      };
    });

    // Filter by shift if selected
    if (filterShift !== 'all') {
      allAttendanceRecords = allAttendanceRecords.filter((record) => {
        const studentShift = studentShiftMap.get(record.studentId);
        return studentShift === filterShift;
      });
    }

    return { sessions, attendanceRecords: allAttendanceRecords };
  }, [attendanceData, selectedMonth, selectedYear, students, filterShift, studentShiftMap]);

  const openEditDialog = (studentId: string, session: AttendanceSession) => {
    const student = students.find((s) => s.id === studentId) || null;
    setEditStudent(student);
    setEditSession(session);

    const statusMap: Partial<Record<AttendanceSession['status'], AttendanceStatus>> = {
      present: 'PRESENT',
      absent: 'ABSENT',
      late: 'LATE',
      excused: 'EXCUSED',
    };

    setEditStatus(statusMap[session.status] || '');
    setEditNotes(session.notes || '');
    setEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editStudent || !editSession) return;

    if (!editStatus) {
      toast.error(tAttendance('selectStatus') || 'Vui lòng chọn trạng thái');
      return;
    }

    if (!editSession.date) {
      toast.error(t('attendanceNoSessionDate') || 'Buổi học này chưa có ngày, không thể cập nhật.');
      return;
    }

    const payload = {
      studentId: editStudent.id,
      classId,
      sessionDate: new Date(editSession.date).toISOString(),
      status: editStatus as AttendanceStatus,
      notes: editNotes || undefined,
    };

    try {
      // Nếu session.id là id thật từ DB thì update, còn "session-*" thì create
      const isDbRecord = !editSession.id.startsWith('session-') && editSession.status !== 'no_data';

      if (isDbRecord) {
        await updateAttendance.mutateAsync({ id: editSession.id, data: payload });
      } else {
        await createAttendance.mutateAsync(payload);
      }

      setEditOpen(false);
    } catch (e) {
      // toast đã được handle trong hook
      console.error(e);
    }
  };
  
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
            {shifts && shifts.length > 0 && (
              <Select value={filterShift} onValueChange={setFilterShift}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder={t('allShifts') || 'Tất cả ca'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allShifts') || 'Tất cả ca'}</SelectItem>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
                        <button
                          type="button"
                          onClick={() => openEditDialog(record.studentId, session)}
                          className="inline-flex cursor-pointer"
                        >
                          {getStatusBadge(session)}
                        </button>
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

    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('attendanceEditTitle')}</DialogTitle>
          <DialogDescription>
            {t('attendanceEditDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
              <span>{editStudent?.fullName || '-'}</span>
              {editStudent?.dob && (
                <span className="flex items-center gap-1 text-xs text-slate-600">
                  <Calendar className="size-3" />
                  {formatDate(editStudent.dob)}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              {editStudent?.class?.shiftName && (
                <span className="flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700">
                  <Clock className="size-3" />
                  {editStudent.class.shiftName}
                </span>
              )}
              {editSession?.date && (
                <span className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-0.5">
                  {tAttendance('date')}: {formatDate(editSession.date)}
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>{tAttendance('selectStatus')}</Label>
            <Select value={editStatus} onValueChange={(v) => setEditStatus(v as AttendanceStatus)}>
              <SelectTrigger className="h-10 border-slate-300 bg-white">
                <SelectValue placeholder={tAttendance('selectStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRESENT">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-green-600" />
                    <span>{tAttendance('status.present')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="ABSENT">
                  <div className="flex items-center gap-2">
                    <XCircle className="size-4 text-red-600" />
                    <span>{tAttendance('status.absent')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="LATE">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-yellow-600" />
                    <span>{tAttendance('status.late')}</span>
                  </div>
                </SelectItem>
                <SelectItem value="EXCUSED">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 text-blue-600" />
                    <span>{tAttendance('status.excused')}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {editStatus !== 'PRESENT' && (
            <div className="grid gap-2">
              <Label>{tAttendance('notes')}</Label>
              <Input
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder={tAttendance('notesPlaceholder')}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setEditOpen(false)}>
            {tCommon('close')}
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={createAttendance.isPending || updateAttendance.isPending}
          >
            <Save className="size-4 mr-2" />
            {tCommon('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </TooltipProvider>
  );
}

