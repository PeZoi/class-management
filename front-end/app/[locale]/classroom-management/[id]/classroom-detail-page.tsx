'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  ClassroomDetailHeader,
  ClassroomDetailRevenueChart,
  ClassroomScheduleInfo,
  ClassroomStatsCards,
  ClassroomStudentsList,
  ClassroomTeacherInfo,
  ClassroomStudentAttendance,
  ClassroomShiftsSection,
} from './_components';
import { StudentDialog } from '../../student-management/_components/student-dialog';
import { PaymentCalendarDialog } from '../../student-management/_components/payment-calendar-dialog';
import { classService, studentService } from '@/services';
import { ClassType, StudentRequest, StudentType, TeacherType, ClassSingleRevenueDataResponse } from '@/types';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';

type TimePeriod = '3months' | '6months' | '12months';

export default function ClassroomDetailPage() {
  const params = useParams();
  const classId = params.id;
  const tNotif = useTranslations('notifications');
  const tCommon = useTranslations('common');

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');
  const [students, setStudents] = useState<StudentType[]>([]);
  const [classData, setClassData] = useState<ClassType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; label: string }>>([]);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [studentForPayment, setStudentForPayment] = useState<{ id: string; fullName: string } | null>(null);

  // Fetch revenue data from BE
  const fetchRevenueData = useCallback(async (classIdParam: string, period: TimePeriod) => {
    try {
      setIsLoadingRevenue(true);
      const response = await classService.getRevenueDataByClassIdAndPeriod(classIdParam, period);
      if (response.status === 200 && response.data) {
        // Map dữ liệu từ BE sang format mà component cần
        const mappedData = response.data.map((item: ClassSingleRevenueDataResponse) => ({
          month: item.month,
          label: item.label,
          revenue: item.revenue || 0,
        }));
        setRevenueData(mappedData);
      }
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      toast.error(tNotif('errorLoadRevenue'));
      setRevenueData([]);
    } finally {
      setIsLoadingRevenue(false);
    }
  }, [tNotif]);

  const fetchStudents = useCallback(async () => {
    if (!classId) return;
    try {
      const response = await studentService.getStudentsByClass(classId as string);
      if (response.status === 200 && response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.log('Lỗi fetch danh sách học sinh', error);
      toast.error(tNotif('errorLoadStudents'));
    }
  }, [classId, tNotif]);

  // Initialize students & class state
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await classService.getClassById(classId as string);
        if (response.status === 200 && response.data) {
          setClassData(response.data);
        }
      } catch (error) {
        console.log('Lỗi fetch thông tin lớp học', error);
        toast.error(tNotif('errorGetClassInfo'));
      } finally {
        setLoading(false);
      }
    };
    if (classId) {
      fetchClass();
      fetchStudents();
    }
  }, [classId, fetchStudents, tNotif]);

  // Fetch revenue data when period or classId changes
  useEffect(() => {
    if (classId) {
      fetchRevenueData(classId as string, selectedPeriod);
    }
  }, [classId, selectedPeriod, fetchRevenueData]);

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
        schedule: tCommon('noSchedule'),
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
      schedule: data.schedule || tCommon('noSchedule'),
      time: '19:00 - 21:00', // Dữ liệu tĩnh
      duration: '3 tháng', // Dữ liệu tĩnh
      monthlyFee: data.monthlyFee || 0,
      collected: data.collected || 0,
      total: data.total || 0,
      description: data.name || '', // Dùng name làm description
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

  // Handle payment success - refresh student list
  const handlePaymentSuccess = async () => {
    try {
      await fetchStudents();
    } catch (error) {
      console.error('Error refreshing students after payment:', error);
    }
  };

  const handleSaveStudent = async (studentData: StudentRequest) => {
    if (!selectedStudent) return;
    try {
      const response = await studentService.updateStudent(studentData, selectedStudent.id);
      if (response.status === 200 && response.data) {
        await fetchStudents();
        toast.success(tNotif('successUpdateStudent'));
        setIsStudentDialogOpen(false);
        setSelectedStudent(null);
      } else {
        toast.error(tNotif('errorUpdateStudent'));
      }
    } catch (error) {
      console.error('Error updating student from classroom detail:', error);
      toast.error(tNotif('errorUpdateStudent'));
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header with Breadcrumb */}
      <ClassroomDetailHeader classData={currentClassData} />

      {/* Stats Cards */}
      <ClassroomStatsCards classData={classData} />

      {/* Class Info & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ClassroomTeacherInfo teacher={classData?.teacher as TeacherType} />
        {classId && <ClassroomScheduleInfo classId={classId as string} />}
      </div>

      {/* Class Shifts Management */}
      {classId && (
        <ClassroomShiftsSection classId={classId as string} />
      )}

      {/* Revenue Chart */}
      {!isLoadingRevenue && revenueData.length > 0 && (
        <ClassroomDetailRevenueChart
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          revenueData={revenueData}
          color={currentClassData.color}
        />
      )}

      {/* Students List */}
      <ClassroomStudentsList 
        students={students} 
        classId={classId as string}
        onEditStudent={handleEditStudent} 
        onPayment={handlePayment}
        onStudentsUpdate={fetchStudents}
      />

      {/* Student Attendance */}
      <ClassroomStudentAttendance students={students} />

      {/* Student Edit Dialog */}
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
    </div>
  );
}
