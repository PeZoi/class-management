'use client';

import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  ClassroomDetailHeader,
  ClassroomDetailRevenueChart,
  ClassroomScheduleInfo,
  ClassroomStatsCards,
  ClassroomStudentsList,
  ClassroomTeacherInfo,
  ClassroomStudentAttendance,
  AttendanceSheet,
} from './_components';
import { StudentDialog } from '../../student-management/_components/student-dialog';
import { PaymentCalendarDialog } from '../../student-management/_components/payment-calendar-dialog';
import { StudentRequest, StudentType, TeacherType } from '@/types';
import { ClassType } from '@/types/class-type';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';
import { HttpError } from '@/lib/http';
import { useClass, useClassRevenueDataByClassId, useClassShiftsByClass } from '@/hooks/use-classes';
import { useStudentsByClass, useUpdateStudent } from '@/hooks/use-students';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TimePeriod } from '@/types/common-type';
import { useAuthStore } from '@/store';

export default function ClassroomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const classId = params.id as string;
  const locale = params.locale as string;
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');
  const { user } = useAuthStore();

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [studentForPayment, setStudentForPayment] = useState<{ id: string; fullName: string } | null>(null);
  const [isAttendanceSheetOpen, setIsAttendanceSheetOpen] = useState(false);

  // Sử dụng TanStack Query hooks
  const {
    data: classData = null,
    isLoading: isLoadingClass,
    error: classError,
  } = useClass(classId);

  const {
    data: students = [],
    isLoading: isLoadingStudents,
    error: studentsError,
  } = useStudentsByClass(classId);

  const {
    data: revenueDataResponse = [],
    isLoading: isLoadingRevenue,
    error: revenueError,
  } = useClassRevenueDataByClassId(classId, selectedPeriod);

  // Fetch shifts ở component cha để share cache với các component khác
  const {
    data: shifts = [],
  } = useClassShiftsByClass(classId);

  const queryClient = useQueryClient();
  const updateStudent = useUpdateStudent();

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
    if (studentsError) {
      toast.error(tNotif('errorLoadStudents'));
    }
  }, [studentsError, tNotif]);

  useEffect(() => {
    if (revenueError) {
      toast.error(tNotif('errorLoadRevenue'));
    }
  }, [revenueError, tNotif]);

  // Map revenue data từ BE sang format mà component cần
  const revenueData = useMemo(() => {
    return revenueDataResponse.map((item) => ({
      month: item.month,
      label: item.label,
      revenue: item.revenue || 0,
    }));
  }, [revenueDataResponse]);

  // Transform ClassType to UI format with additional static fields
  const getClassDataForUI = useCallback((data: ClassType | null) => {
    if (!data) {
      return {
        id: 0,
        name: tCommon('noName'),
        teacher: tCommon('noTeacher'),
        teacherEmail: '',
        teacherPhone: '',
        students: 0,
        revenue: 0,
        time: '19:00 - 21:00', // Dữ liệu tĩnh
        duration: '3 tháng', // Dữ liệu tĩnh
        monthlyFee: 0,
        collected: 0,
        total: 0,
        description: '',
        color: '#3b82f6', // Dữ liệu tĩnh
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
      time: '19:00 - 21:00', // Dữ liệu tĩnh
      duration: '3 tháng', // Dữ liệu tĩnh
      monthlyFee: data.monthlyFee || 0,
      collected: data.collected || 0,
      total: data.total || 0,
      description: data.description || data.name || '',
      color: '#3b82f6', // Dữ liệu tĩnh
    };
  }, [tCommon]);

  const currentClassData = getClassDataForUI(classData);

  const handleEditStudent = (student: StudentType) => {
    setSelectedStudent(student);
    setIsStudentDialogOpen(true);
  };

  const handlePayment = (student: StudentType) => {
    setStudentForPayment({ id: student.id, fullName: student.fullName });
    setIsPaymentDialogOpen(true);
  };

  // Handle payment success - không cần làm gì vì TanStack Query tự động refetch
  const handlePaymentSuccess = useCallback(() => {
    // TanStack Query sẽ tự động invalidate và refetch students sau khi payment được tạo
    // (được xử lý trong payment mutation hooks)
  }, []);

  const handleSaveStudent = useCallback(
    async (studentData: StudentRequest) => {
      if (!selectedStudent) return;
      
      // Chuẩn hóa dữ liệu: nếu classShiftId là chuỗi rỗng hoặc không có ca học, loại bỏ khỏi payload
      const normalizedData: StudentRequest = {
        ...studentData,
      };
      
      // Loại bỏ classShiftId nếu rỗng để tránh lỗi khi lớp chưa có ca học
      if (!normalizedData.classShiftId || normalizedData.classShiftId.trim() === '') {
        delete normalizedData.classShiftId;
      }
      
      await updateStudent.mutateAsync({ id: selectedStudent.id, data: normalizedData });
      setIsStudentDialogOpen(false);
      setSelectedStudent(null);
    },
    [selectedStudent, updateStudent]
  );

  const isLoading = isLoadingClass || isLoadingStudents;

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header with Breadcrumb */}
      <ClassroomDetailHeader classData={currentClassData} />

      {/* Stats Cards */}
      <ClassroomStatsCards classData={classData ?? null} />

      {/* Class Info & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassroomTeacherInfo teacher={classData?.teacher as TeacherType} />
        {classId && <ClassroomScheduleInfo classId={classId as string} isTeacher={isTeacher} />}
      </div>

      {/* Revenue Chart - Only show for admin */}
      {!isTeacher && (
        <ClassroomDetailRevenueChart
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          revenueData={revenueData}
          color={currentClassData.color}
          isLoading={isLoadingRevenue}
        />
      )}

      {/* Students List */}
      <ClassroomStudentsList 
        students={students} 
        classId={classId}
        onEditStudent={isTeacher ? undefined : handleEditStudent} 
        onPayment={isTeacher ? undefined : handlePayment}
        onStudentsUpdate={() => {
          // TanStack Query tự động refetch khi cần
        }}
        isTeacher={isTeacher}
      />

      {/* Student Attendance */}
      <ClassroomStudentAttendance students={students} classId={classId} shifts={shifts} />

      {/* Attendance Sheet with Collapse */}
      <Collapsible open={isAttendanceSheetOpen} onOpenChange={setIsAttendanceSheetOpen}>
        <div className="flex justify-end mb-4">
          <CollapsibleTrigger asChild>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <ClipboardCheck className="size-5 mr-2" />
              {tCommon('takeAttendance')}
              {isAttendanceSheetOpen ? (
                <ChevronUp className="size-5 ml-2" />
              ) : (
                <ChevronDown className="size-5 ml-2" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <AttendanceSheet
            open={isAttendanceSheetOpen}
            onOpenChange={setIsAttendanceSheetOpen}
            classId={classId}
            students={students}
            shifts={shifts}
            onSuccess={() => {
              // TanStack Query tự động refetch students và attendance
              queryClient.invalidateQueries({ queryKey: queryKeys.students.all });
              queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
            }}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Student Edit Dialog - Only for admin */}
      {!isTeacher && (
        <>
          <StudentDialog
            open={isStudentDialogOpen}
            onOpenChange={(open) => {
              setIsStudentDialogOpen(open);
              if (!open) {
                setSelectedStudent(null);
              }
            }}
            student={selectedStudent}
            onSave={handleSaveStudent}
          />

          {/* Payment Calendar Dialog */}
          <PaymentCalendarDialog
            open={isPaymentDialogOpen}
            onOpenChange={setIsPaymentDialogOpen}
            student={studentForPayment}
            onPaymentSuccess={handlePaymentSuccess}
          />
        </>
      )}
    </div>
  );
}
