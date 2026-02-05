'use client';

import { useState, useMemo, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentType, AttendanceStatus, CreateAttendanceData, ClassShiftType } from '@/types';
import { useCreateBulkAttendance, useAttendanceByClass } from '@/hooks/use-attendance';
import { CheckCircle2, XCircle, Clock, AlertCircle, Save, Calendar, Search, Filter, Users, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface AttendanceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  students: StudentType[];
  shifts?: ClassShiftType[];
  onSuccess?: () => void;
}

interface StudentAttendanceForm {
  studentId: string;
  studentName: string;
  status?: AttendanceStatus; // undefined = chưa điểm danh
  notes?: string;
}

export function AttendanceSheet({
  open,
  onOpenChange,
  classId,
  students,
  shifts = [],
  onSuccess,
}: AttendanceSheetProps) {
  const t = useTranslations('attendance');
  const tCommon = useTranslations('common');

  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [markedStudents, setMarkedStudents] = useState<Set<string>>(new Set());

  // Initialize attendance list from students prop
  const [attendanceList, setAttendanceList] = useState<StudentAttendanceForm[]>(() =>
    students.map((student) => ({
      studentId: student.id,
      studentName: student.fullName,
      status: undefined, // Mặc định chưa điểm danh
      notes: undefined,
    }))
  );

  const createBulkAttendance = useCreateBulkAttendance();
  
  // Fetch existing attendance data for this class
  const { data: existingAttendanceData } = useAttendanceByClass(classId);

  // Update attendance list when dialog opens or sessionDate changes
  useEffect(() => {
    if (!open) return;

    const selectedDateStr = new Date(sessionDate).toISOString().split('T')[0];
    
    // Filter attendance data by selected date
    const attendanceForDate = existingAttendanceData?.filter((attendance) => {
      const attendanceDateStr = new Date(attendance.sessionDate).toISOString().split('T')[0];
      return attendanceDateStr === selectedDateStr;
    }) || [];

    // Create a map of studentId -> attendance record
    const attendanceMap = new Map(
      attendanceForDate.map((att) => [att.studentId, att])
    );

    // Initialize attendance list
    const initialList = students.map((student) => {
      const existingAttendance = attendanceMap.get(student.id);
      
      if (existingAttendance) {
        // Load existing data
        return {
          studentId: student.id,
          studentName: student.fullName,
          status: existingAttendance.status,
          notes: existingAttendance.notes,
        };
      }
      
      // Default for unmarked students - chưa điểm danh
      return {
        studentId: student.id,
        studentName: student.fullName,
        status: undefined,
        notes: undefined,
      };
    });

    // Update state when dialog opens or date changes
    setAttendanceList(initialList);
    
    // Mark students who already have attendance records
    const markedSet = new Set(attendanceForDate.map((att) => att.studentId));
    setMarkedStudents(markedSet);
    
    setSearchQuery('');
    setFilterShift('all');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionDate]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceList((prev) =>
      prev.map((item) =>
        item.studentId === studentId ? { ...item, status } : item
      )
    );
    // Mark as attended
    setMarkedStudents((prev) => new Set(prev).add(studentId));
  };

  const handleUnmark = (studentId: string) => {
    // Bỏ tích - xóa học viên khỏi danh sách đã điểm danh
    setMarkedStudents((prev) => {
      const newSet = new Set(prev);
      newSet.delete(studentId);
      return newSet;
    });
    // Reset về trạng thái chưa điểm danh
    setAttendanceList((prev) =>
      prev.map((item) =>
        item.studentId === studentId
          ? { ...item, status: undefined, notes: undefined }
          : item
      )
    );
  };

  const handleUnmarkAll = () => {
    // Bỏ chọn tất cả - clear toàn bộ marked students
    setMarkedStudents(new Set());
    // Reset tất cả về trạng thái chưa điểm danh
    setAttendanceList((prev) =>
      prev.map((item) => ({
        ...item,
        status: undefined,
        notes: undefined,
      }))
    );
  };

  const handleSubmit = async () => {
    if (!sessionDate) {
      toast.error(t('errorSelectDate'));
      return;
    }

    // Chỉ gửi những học viên đã được tích (marked) và có status
    const markedAttendanceList = attendanceList.filter((item) => 
      markedStudents.has(item.studentId) && item.status !== undefined
    );

    if (markedAttendanceList.length === 0) {
      toast.error(t('errorNoStudentsMarked') || 'Vui lòng điểm danh ít nhất 1 học viên');
      return;
    }

    const attendanceData: CreateAttendanceData[] = markedAttendanceList.map((item) => ({
      studentId: item.studentId,
      classId,
      sessionDate: new Date(sessionDate).toISOString(),
      status: item.status!, // Safe to use ! because we filtered undefined above
      notes: item.notes,
    }));

    try {
      await createBulkAttendance.mutateAsync(attendanceData);
      onSuccess?.();
      onOpenChange(false);
      // Reset form
      setSessionDate(new Date().toISOString().split('T')[0]);
      setMarkedStudents(new Set());
      setAttendanceList(
        students.map((student) => ({
          studentId: student.id,
          studentName: student.fullName,
          status: undefined, // Chưa điểm danh
          notes: undefined,
        }))
      );
    } catch (error) {
      console.error('Error creating attendance:', error);
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return CheckCircle2;
      case 'ABSENT':
        return XCircle;
      case 'LATE':
        return Clock;
      case 'EXCUSED':
        return AlertCircle;
      default:
        return CheckCircle2;
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200';
      case 'ABSENT':
        return 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';
      case 'LATE':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200';
      case 'EXCUSED':
        return 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const statusOptions: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

  // Get student's shift ID from students prop
  const studentShiftMap = useMemo(() => {
    const map = new Map<string, string>();
    students.forEach((student) => {
      if (student.class?.shiftId) {
        map.set(student.id, student.class.shiftId);
      }
    });
    return map;
  }, [students]);

  // Split students into unmarked and marked with filtering
  const { unmarkedStudents, markedStudentsList } = useMemo(() => {
    let filtered = attendanceList.filter((student) =>
      student.studentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter by shift if selected
    if (filterShift !== 'all') {
      filtered = filtered.filter((student) => {
        const studentShift = studentShiftMap.get(student.studentId);
        return studentShift === filterShift;
      });
    }

    const unmarked = filtered.filter((s) => !markedStudents.has(s.studentId));
    const marked = filtered.filter((s) => markedStudents.has(s.studentId));

    return {
      unmarkedStudents: unmarked,
      markedStudentsList: marked,
    };
  }, [attendanceList, searchQuery, markedStudents, filterShift, studentShiftMap]);

  const stats = useMemo(() => {
    // Chỉ đếm những học viên đã được tích (có status)
    const markedList = attendanceList.filter((a) => a.status !== undefined);
    const present = markedList.filter((a) => a.status === 'PRESENT').length;
    const absent = markedList.filter((a) => a.status === 'ABSENT').length;
    const late = markedList.filter((a) => a.status === 'LATE').length;
    const excused = markedList.filter((a) => a.status === 'EXCUSED').length;
    return { present, absent, late, excused };
  }, [attendanceList]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[80%]! max-w-[1400px]! h-[90vh] flex flex-col p-0 overflow-x-hidden">
        {/* Header - Fixed */}
        <div className="px-6 py-5 pb-0 text-black shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-semibold">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Calendar className="size-6" />
              </div>
              {t('title')}
            </DialogTitle>
            <DialogDescription className="text-gray-500 mt-1.5">
              {t('description')}
            </DialogDescription>
          </DialogHeader>
          <Separator className="my-6" />
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 pt-0 space-y-5 min-h-0">
          
          {/* Filter Section */}
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Session Date */}
                <div>
                  <Label htmlFor="sessionDate" className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Calendar className="size-4 text-slate-500" />
                    {t('sessionDate')}
                  </Label>
                  <Input
                    id="sessionDate"
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="h-10 border-slate-300"
                  />
                </div>

                {/* Search */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Search className="size-4 text-slate-500" />
                    {t('searchStudent')}
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <Input
                      placeholder={t('searchStudent') || 'Tìm kiếm học viên...'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 border-slate-300"
                    />
                  </div>
                </div>

                {/* Shift Filter */}
                {shifts && shifts.length > 0 ? (
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                      <Filter className="size-4 text-slate-500" />
                      {t('shift')}
                    </Label>
                    <Select value={filterShift} onValueChange={setFilterShift}>
                      <SelectTrigger className="h-10 border-slate-300">
                        <SelectValue placeholder={t('allShifts')} />
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
                  </div>
                ) : (
                  <div /> // Empty div for grid layout when no shifts
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Bar */}
          <div className="bg-linear-to-r from-slate-50 to-slate-100/50 dark:from-slate-800 dark:to-slate-800/50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline" className="bg-white border-green-300 text-green-700 px-3 py-1.5 text-sm font-medium shadow-sm">
                  <CheckCircle2 className="size-4 mr-1.5" />
                  {t('status.present')}: {stats.present}
                </Badge>
                <Badge variant="outline" className="bg-white border-red-300 text-red-700 px-3 py-1.5 text-sm font-medium shadow-sm">
                  <XCircle className="size-4 mr-1.5" />
                  {t('status.absent')}: {stats.absent}
                </Badge>
                <Badge variant="outline" className="bg-white border-yellow-300 text-yellow-700 px-3 py-1.5 text-sm font-medium shadow-sm">
                  <Clock className="size-4 mr-1.5" />
                  {t('status.late')}: {stats.late}
                </Badge>
                <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 px-3 py-1.5 text-sm font-medium shadow-sm">
                  <AlertCircle className="size-4 mr-1.5" />
                  {t('status.excused')}: {stats.excused}
                </Badge>
              </div>
              <div className="text-sm font-medium text-slate-700 bg-white px-4 py-2 rounded-lg border border-slate-200">
                {t('markedCount', { marked: markedStudents.size, total: students.length }) || 
                  `Đã điểm danh: ${markedStudents.size}/${students.length}`}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-5">
            {/* Left: Unmarked Students */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2 bg-linear-to-r from-slate-100 to-slate-50 rounded-lg border border-slate-200">
                <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                  <Users className="size-5 text-slate-600" />
                  {t('unmarkedStudents') || 'Chưa điểm danh'}
                </Label>
                <Badge variant="outline" className="bg-white border-slate-300 text-slate-700 px-3 py-1 font-semibold">
                  {unmarkedStudents.length}
                </Badge>
              </div>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {unmarkedStudents.length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                    <Users className="size-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">
                      {searchQuery ? (t('noStudentsFound') || 'Không tìm thấy') : (t('allMarked') || 'Đã điểm danh hết')}
                    </p>
                  </div>
                ) : (
                  unmarkedStudents.map((item) => (
                    <div 
                      key={item.studentId} 
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                      <span className="font-medium text-slate-700">
                        {item.studentName}
                      </span>
                      <Select 
                        value={item.status || ''} 
                        onValueChange={(value) => handleStatusChange(item.studentId, value as AttendanceStatus)}
                      >
                        <SelectTrigger className="w-[180px] h-9 border-slate-300">
                          <SelectValue placeholder={t('selectStatus') || 'Chọn trạng thái'} />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => {
                            const Icon = getStatusIcon(status);
                            return (
                              <SelectItem key={status} value={status}>
                                <div className="flex items-center gap-2">
                                  <Icon className="size-4" />
                                  <span>{t(`status.${status.toLowerCase()}`)}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right: Marked Students */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2 bg-linear-to-r from-blue-100 to-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Label className="text-base font-semibold text-blue-800 flex items-center gap-2">
                    <CheckCircle2 className="size-5 text-blue-600" />
                    {t('markedStudents') || 'Đã điểm danh'}
                  </Label>
                  <Badge variant="outline" className="bg-white border-blue-300 text-blue-700 px-3 py-1 font-semibold">
                    {markedStudentsList.length}
                  </Badge>
                </div>
                {markedStudentsList.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleUnmarkAll}
                    className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  >
                    <X className="size-3.5 mr-1" />
                    {t('unmarkAll') || 'Bỏ chọn tất cả'}
                  </Button>
                )}
              </div>
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-100">
                {markedStudentsList.length === 0 ? (
                  <div className="text-center py-16 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200">
                    <CheckCircle2 className="size-12 text-blue-300 mx-auto mb-3" />
                    <p className="text-blue-600 text-sm font-medium">
                      {t('noMarkedYet') || 'Chưa có học viên nào được điểm danh'}
                    </p>
                  </div>
                ) : (
                  markedStudentsList.map((item) => {
                    // Skip nếu chưa có status (không nên xảy ra nhưng để safe)
                    if (!item.status) return null;
                    
                    const StatusIcon = getStatusIcon(item.status);
                    return (
                      <div 
                        key={item.studentId} 
                        className="flex items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <span className="font-medium text-slate-700 truncate">
                          {item.studentName}
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <Select 
                            value={item.status} 
                            onValueChange={(value) => handleStatusChange(item.studentId, value as AttendanceStatus)}
                          >
                            <SelectTrigger className={`h-8 w-auto min-w-[140px] border ${getStatusColor(item.status)} font-medium text-sm`}>
                              <div className="flex items-center gap-2">
                                <StatusIcon className="size-4" />
                                <span>{t(`status.${item.status.toLowerCase()}`)}</span>
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((status) => {
                                const Icon = getStatusIcon(status);
                                return (
                                  <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="size-4" />
                                      <span>{t(`status.${status.toLowerCase()}`)}</span>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnmark(item.studentId)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            title={t('unmark') || 'Bỏ tích'}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      </div>

                    );
                  })
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Footer - Fixed */}
        <div className="border-t bg-slate-50/50 px-6 py-4 shrink-0">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="text-sm font-medium text-slate-700 bg-white px-4 py-2 rounded-lg border border-slate-200">
              {t('totalStudents', { count: students.length }) || `Tổng: ${students.length} học viên`}
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="px-6 h-11 border-slate-300 hover:bg-slate-100"
              >
                {tCommon('cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createBulkAttendance.isPending}
                className="bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 h-11 shadow-md hover:shadow-lg transition-all"
              >
                <Save className="size-5 mr-2" />
                {createBulkAttendance.isPending ? t('saving') : t('saveAttendance')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

