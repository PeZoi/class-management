import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateLong } from '@/utils/helper';
import { Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AttendanceRecord {
  id: string;
  date: string;
  className: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late' | 'early_leave';
  notes?: string;
}

interface TeacherAttendanceProps {
  attendanceRecords: AttendanceRecord[];
}

export function TeacherAttendance({ attendanceRecords }: TeacherAttendanceProps) {
  const t = useTranslations('teacher-detail');

  const formatTime = (timeString?: string) => {
    if (!timeString) return '-';
    const date = new Date(timeString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
      present: {
        label: t('present') || 'Có mặt',
        icon: CheckCircle2,
        className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      absent: {
        label: t('absent') || 'Vắng mặt',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      late: {
        label: t('late') || 'Đi muộn',
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      early_leave: {
        label: t('earlyLeave') || 'Về sớm',
        icon: Clock,
        className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
    };
    const variant = variants[status] || variants.present;
    const Icon = variant.icon;
    return (
      <Badge className={variant.className}>
        <Icon className="size-3 mr-1" />
        {variant.label}
      </Badge>
    );
  };

  // Calculate statistics
  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((r) => r.status === 'present').length;
  const absentDays = attendanceRecords.filter((r) => r.status === 'absent').length;
  const lateDays = attendanceRecords.filter((r) => r.status === 'late').length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : '0';

  if (attendanceRecords.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {t('attendance') || 'Điểm danh'}
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Calendar className="size-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            {t('noAttendanceRecords')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="size-5" />
            {t('attendance') || 'Điểm danh'}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-slate-900 dark:text-slate-100">{attendanceRate}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t('attendanceRate') || 'Tỷ lệ có mặt'}
              </div>
            </div>
          </div>
        </div>
        {/* Statistics */}
        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalDays}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('totalDays') || 'Tổng ngày'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{presentDays}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('presentDays') || 'Có mặt'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{absentDays}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('absentDays') || 'Vắng mặt'}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lateDays}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('lateDays') || 'Đi muộn'}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-slate-200 dark:border-slate-700">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('date')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('className')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {t('checkIn')}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {t('checkOut') || 'Giờ ra'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300 text-center">
                  {t('status') || 'Trạng thái'}
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  {t('notes') || 'Ghi chú'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendanceRecords.map((record) => (
                <TableRow
                  key={record.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {formatDateLong(record.date)}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">{record.className}</TableCell>
                  <TableCell className="text-center text-slate-600 dark:text-slate-400">
                    {formatTime(record.checkInTime)}
                  </TableCell>
                  <TableCell className="text-center text-slate-600 dark:text-slate-400">
                    {formatTime(record.checkOutTime)}
                  </TableCell>
                  <TableCell className="text-center">{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-sm text-slate-500 dark:text-slate-400">
                    {record.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

