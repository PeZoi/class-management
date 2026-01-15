'use client';

import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
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
import { classService, studentService } from '@/services';
import { ClassType, StudentRequest, StudentType, TeacherType, ClassSingleRevenueDataResponse } from '@/types';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';

type TimePeriod = '3months' | '6months' | '12months';

export default function ClassroomDetailPage() {
  const params = useParams();
  const classId = params.id;

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('6months');
  const [students, setStudents] = useState<StudentType[]>([]);
  const [classData, setClassData] = useState<ClassType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(false);
  const [revenueData, setRevenueData] = useState<Array<{ month: string; revenue: number; label: string }>>([]);
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);

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
      toast.error('Không thể tải dữ liệu doanh thu');
      setRevenueData([]);
    } finally {
      setIsLoadingRevenue(false);
    }
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!classId) return;
    try {
      const response = await studentService.getStudentsByClass(classId as string);
      if (response.status === 200 && response.data) {
        setStudents(response.data);
      }
    } catch (error) {
      console.log('Lỗi fetch danh sách học sinh', error);
      toast.error('Không thể tải danh sách học sinh.');
    }
  }, [classId]);

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
        toast.error('Không thể tải thông tin lớp học.');
      } finally {
        setLoading(false);
      }
    };
    if (classId) {
      fetchClass();
      fetchStudents();
    }
  }, [classId, fetchStudents]);

  // Fetch revenue data when period or classId changes
  useEffect(() => {
    if (classId) {
      fetchRevenueData(classId as string, selectedPeriod);
    }
  }, [classId, selectedPeriod, fetchRevenueData]);

  // Transform ClassType to UI format with additional static fields
  const getClassDataForUI = (data: ClassType | null) => {
    if (!data) {
      return {
        id: 0,
        name: 'Chưa có tên',
        teacher: 'Chưa có giáo viên',
        teacherEmail: '',
        teacherPhone: '',
        students: 0,
        revenue: 0,
        schedule: 'Chưa có lịch học',
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
      name: data.name || 'Chưa có tên',
      teacher: data.teacher?.fullName || 'Chưa có giáo viên',
      teacherEmail: data.teacher?.email || '',
      teacherPhone: data.teacher?.phoneNumber || '',
      students: data.studentCount || 0,
      revenue: data.revenue || 0,
      schedule: data.schedule || 'Chưa có lịch học',
      time: '19:00 - 21:00', // Dữ liệu tĩnh
      duration: '3 tháng', // Dữ liệu tĩnh
      monthlyFee: data.monthlyFee || 0,
      collected: data.collected || 0,
      total: data.total || 0,
      description: data.name || '', // Dùng name làm description
      color: '#3b82f6', // Dữ liệu tĩnh
    };
  };

  const currentClassData = getClassDataForUI(classData);

  const handleEditStudent = (student: StudentType) => {
    setSelectedStudent(student);
    setIsStudentDialogOpen(true);
  };

  const handleSaveStudent = async (studentData: StudentRequest) => {
    if (!selectedStudent) return;
    try {
      const response = await studentService.updateStudent(studentData, selectedStudent.id);
      if (response.status === 200 && response.data) {
        await fetchStudents();
        toast.success('Cập nhật học viên thành công');
        setIsStudentDialogOpen(false);
        setSelectedStudent(null);
      } else {
        toast.error('Cập nhật học viên thất bại');
      }
    } catch (error) {
      console.error('Error updating student from classroom detail:', error);
      toast.error('Cập nhật học viên thất bại');
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
      <ClassroomStudentsList students={students} onEditStudent={handleEditStudent} />

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
    </div>
  );
}
