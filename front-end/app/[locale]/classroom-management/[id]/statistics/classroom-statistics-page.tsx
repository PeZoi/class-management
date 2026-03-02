'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ClassroomDetailHeader,
  ClassroomDetailRevenueChart,
  AttendanceStatusChart,
  AttendanceByShiftChart,
  AttendanceStatusByShiftChart,
} from '../_components';
import { ClassType } from '@/types/class-type';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';
import { HttpError } from '@/lib/http';
import { useClass, useClassRevenueDataByClassId, useClassShiftsByClass } from '@/hooks/use-classes';
import { useStudentsByClass } from '@/hooks/use-students';
import { useAttendanceByClass } from '@/hooks/use-attendance';
import { TimePeriod } from '@/types/common-type';
import { useAuthStore } from '@/store';

export default function ClassroomStatisticsPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const locale = params.locale as string;
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');

  // Sử dụng TanStack Query hooks
  const {
    data: classData = null,
    isLoading: isLoadingClass,
    error: classError,
  } = useClass(classId);

  const {
    data: revenueDataResponse = [],
    isLoading: isLoadingRevenue,
    error: revenueError,
  } = useClassRevenueDataByClassId(classId, selectedPeriod);

  const {
    data: students = [],
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useStudentsByClass(classId);

  const {
    data: attendanceData = [],
    isLoading: isLoadingAttendance,
    error: attendanceError,
  } = useAttendanceByClass(classId);

  const {
    data: shifts = [],
  } = useClassShiftsByClass(classId);

  // Check if user is teacher
  const isTeacher = user?.role === 'ROLE_TEACHER';

  // Check if teacher can access this class
  useEffect(() => {
    if (isTeacher && classData) {
      // Check if the current user is the teacher of this class
      if (classData.teacher?.id !== user.id) {
        // Teacher is trying to access a class they don't teach - redirect to 403
        router.push(`/${locale}/forbidden`);
      }
    }
  }, [isTeacher, classData, user, router, locale]);

  // Xử lý 404 và 403 errors - redirect to appropriate page
  useEffect(() => {
    if (classError instanceof HttpError) {
      if (classError.status === 404) {
        router.push(`/${locale}/__not-found__`);
      } else if (classError.status === 403) {
        router.push(`/${locale}/forbidden`);
      }
    }
  }, [classError, router, locale]);

  // Hiển thị error toast
  useEffect(() => {
    if (classError && !(classError instanceof HttpError && classError.status === 404)) {
      toast.error(tNotif('errorGetClassInfo'));
    }
  }, [classError, tNotif]);

  useEffect(() => {
    if (revenueError) {
      toast.error(tNotif('errorLoadRevenue'));
    }
  }, [revenueError, tNotif]);

  useEffect(() => {
    if (studentsError) {
      toast.error(tNotif('errorLoadStudents'));
    }
  }, [studentsError, tNotif]);

  useEffect(() => {
    if (attendanceError) {
      toast.error(tNotif('errorLoadAttendance') || 'Không thể tải dữ liệu điểm danh');
    }
  }, [attendanceError, tNotif]);

  // Map revenue data từ BE sang format mà component cần
  const revenueData = useMemo(() => {
    return revenueDataResponse.map((item) => ({
      month: item.month,
      label: item.label,
      revenue: item.revenue || 0,
    }));
  }, [revenueDataResponse]);

  const tAttendance = useTranslations('attendance');

  // Calculate attendance status distribution
  const attendanceStatusData = useMemo(() => {
    const statusCounts = {
      PRESENT: 0,
      ABSENT: 0,
      LATE: 0,
      EXCUSED: 0,
    };

    attendanceData.forEach((attendance) => {
      if (attendance.status in statusCounts) {
        statusCounts[attendance.status as keyof typeof statusCounts] += 1;
      }
    });

    return [
      {
        name: tAttendance('status.present') || 'Có mặt',
        value: statusCounts.PRESENT,
        color: '#10b981',
      },
      {
        name: tAttendance('status.absent') || 'Vắng mặt',
        value: statusCounts.ABSENT,
        color: '#ef4444',
      },
      {
        name: tAttendance('status.late') || 'Đi muộn',
        value: statusCounts.LATE,
        color: '#f59e0b',
      },
      {
        name: tAttendance('status.excused') || 'Có phép',
        value: statusCounts.EXCUSED,
        color: '#3b82f6',
      },
    ].filter((item) => item.value > 0);
  }, [attendanceData, tAttendance]);

  // Calculate attendance by shift (aggregate)
  const attendanceByShiftData = useMemo(() => {
    if (shifts.length === 0) return [];

    const shiftMap = new Map<
      string,
      { shiftName: string; present: number; absent: number; late: number; excused: number }
    >();

    // Initialize shift map
    shifts.forEach((shift) => {
      shiftMap.set(shift.id, {
        shiftName: shift.name,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
      });
    });

    // Map students to shifts
    const studentShiftMap = new Map<string, string>();
    students.forEach((student) => {
      if (student.class?.shiftId) {
        studentShiftMap.set(student.id, student.class.shiftId);
      }
    });

    // Count attendance by shift
    attendanceData.forEach((attendance) => {
      const shiftId = studentShiftMap.get(attendance.studentId);
      if (!shiftId) return;

      const shiftData = shiftMap.get(shiftId);
      if (!shiftData) return;

      switch (attendance.status) {
        case 'PRESENT':
          shiftData.present += 1;
          break;
        case 'ABSENT':
          shiftData.absent += 1;
          break;
        case 'LATE':
          shiftData.late += 1;
          break;
        case 'EXCUSED':
          shiftData.excused += 1;
          break;
      }
    });

    return Array.from(shiftMap.values());
  }, [attendanceData, shifts, students]);

  // Calculate attendance by shift & student (for stacked column chart)
  const attendanceByShiftStudentData = useMemo(() => {
    if (shifts.length === 0) return [];

    type StudentAgg = {
      studentId: string;
      studentName: string;
      present: number;
      absent: number;
      late: number;
      excused: number;
      total: number;
    };

    const shiftMap = new Map<string, { shiftName: string; students: Map<string, StudentAgg> }>();

    // Initialize shift map
    shifts.forEach((shift) => {
      shiftMap.set(shift.id, {
        shiftName: shift.name,
        students: new Map<string, StudentAgg>(),
      });
    });

    // Map students to shifts
    const studentShiftMap = new Map<string, string>();
    students.forEach((student) => {
      if (student.class?.shiftId) {
        studentShiftMap.set(student.id, student.class.shiftId);
      }
    });

    // Aggregate attendance per student per shift
    attendanceData.forEach((attendance) => {
      const shiftId = studentShiftMap.get(attendance.studentId);
      if (!shiftId) return;

      const shiftEntry = shiftMap.get(shiftId);
      if (!shiftEntry) return;

      if (!shiftEntry.students.has(attendance.studentId)) {
        shiftEntry.students.set(attendance.studentId, {
          studentId: attendance.studentId,
          studentName: attendance.studentName,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0,
          total: 0,
        });
      }

      const studentAgg = shiftEntry.students.get(attendance.studentId)!;
      studentAgg.total += 1;

      switch (attendance.status) {
        case 'PRESENT':
          studentAgg.present += 1;
          break;
        case 'ABSENT':
          studentAgg.absent += 1;
          break;
        case 'LATE':
          studentAgg.late += 1;
          break;
        case 'EXCUSED':
          studentAgg.excused += 1;
          break;
      }
    });

    // Convert to array and compute percentages per student
    return Array.from(shiftMap.values())
      .map((shiftEntry) => ({
        shiftName: shiftEntry.shiftName,
        students: Array.from(shiftEntry.students.values()).map((s) => ({
          studentName: s.studentName,
          presentRate: s.total > 0 ? (s.present / s.total) * 100 : 0,
          absentRate: s.total > 0 ? (s.absent / s.total) * 100 : 0,
          lateRate: s.total > 0 ? (s.late / s.total) * 100 : 0,
          excusedRate: s.total > 0 ? (s.excused / s.total) * 100 : 0,
        })),
      }))
      .filter((shift) => shift.students.length > 0);
  }, [attendanceData, shifts, students]);

  // Transform ClassType to UI format with additional static fields
  const getClassDataForUI = (data: ClassType | null) => {
    if (!data) {
      return {
        id: 0,
        name: tCommon('noName'),
        teacher: tCommon('noTeacher'),
        teacherEmail: '',
        teacherPhone: '',
        students: 0,
        revenue: 0,
        time: '19:00 - 21:00',
        duration: '3 tháng',
        monthlyFee: 0,
        collected: 0,
        total: 0,
        description: '',
        color: '#3b82f6',
      };
    }
    return {
      id: Number(data.id) || 0,
      name: data.name || tCommon('noName'),
      teacher: data.teacher?.fullName || tCommon('noTeacher'),
      teacherEmail: data.teacher?.email || '',
      teacherPhone: data.teacher?.phoneNumber || '',
      students: data.studentCount || 0,
      revenue: data.revenue || 0,
      time: '19:00 - 21:00',
      duration: '3 tháng',
      monthlyFee: data.monthlyFee || 0,
      collected: data.collected || 0,
      total: data.total || 0,
      description: data.description || data.name || '',
      color: '#3b82f6',
    };
  };

  const currentClassData = getClassDataForUI(classData);

  const isLoading = isLoadingClass || isLoadingStudents || isLoadingAttendance;

  if (isLoading) {
    return <PageLoading />;
  }

  // Redirect teachers away from statistics page
  if (isTeacher) {
    router.push(`/${locale}/classroom-management/${classId}`);
    return null;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header with Breadcrumb */}
      <div className="space-y-4">
        <ClassroomDetailHeader classData={currentClassData} />
      </div>

      {/* Revenue Chart */}
      <ClassroomDetailRevenueChart
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
        revenueData={revenueData}
        color={currentClassData.color}
        isLoading={isLoadingRevenue}
      />

      {/* Attendance Charts Section */}
      <div className="space-y-6">
        
        {/* Attendance Status Chart */}
        <AttendanceStatusChart data={attendanceStatusData} isLoading={isLoadingAttendance} />

        {/* Attendance Status by Shift & Student (stacked columns per student in each shift) */}
        <AttendanceStatusByShiftChart
          data={attendanceByShiftStudentData}
          isLoading={isLoadingAttendance}
        />

        {/* Attendance By Shift Chart - Only show if there are shifts */}
        {shifts.length > 0 && (
          <AttendanceByShiftChart data={attendanceByShiftData} isLoading={isLoadingAttendance} />
        )}
      </div>
    </div>
  );
}

