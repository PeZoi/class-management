'use client';

import { useEffect, useState } from 'react';
import { TeacherTable } from './_components/teacher-table';
import { TeacherDialog } from './_components/teacher-dialog';
import { SalaryPaymentDialog } from './_components/salary-payment-dialog';
import { teacherService } from '@/services';
import { toast } from 'react-toastify';
import { TeacherType } from '@/types';

// Mock data - trong thực tế sẽ fetch từ API
// const initialTeachers: TeacherType[] = [
//   {
//     id: 1,
//     gender: 'MALE',
//     name: 'Nguyễn Văn A',
//     email: 'nguyenvana@example.com',
//     phone: '0912345678',
//     salary: 15000000, // 15 triệu/tháng
//     experience: 5,
//     totalClasses: 3,
//     dob: '1990-05-15',
//     idCard: '001090012345',
//     joinedDate: '2023-01-15',
//   },
//   {
//     id: 2,
//     gender: 'FEMALE',
//     name: 'Trần Thị B',
//     email: 'tranthib@example.com',
//     phone: '0987654321',
//     salary: 18000000, // 18 triệu/tháng
//     experience: 8,
//     totalClasses: 2,
//     dob: '1987-08-22',
//     idCard: '001087054321',
//     joinedDate: '2023-03-20',
//   },
// ];

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<TeacherType[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherType | null>(null);
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false);
  const [teacherForSalary, setTeacherForSalary] = useState<TeacherType | null>(null);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await teacherService.getAllTeachers();
        setTeachers(response.data || []);
      } catch (error) {
        toast.error('Không thể tải danh sách giáo viên');
        console.error('Error fetching teachers:', error);
      }
    };
    fetchTeachers();
  }, []);

  const handleAdd = () => {
    setSelectedTeacher(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (teacher: TeacherType) => {
    setSelectedTeacher(teacher);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = (teacherData: Partial<TeacherType>) => {
    if (selectedTeacher) {
      // Update existing teacher
      setTeachers((prev) => prev.map((t) => (t.id === selectedTeacher.id ? { ...t, ...teacherData } : t)));
    } else {
      // Add new teacher
      // const newTeacher: TeacherType = {
      //   id: Math.max(...teachers.map((t) => t.id)) + 1,
      //   name: teacherData.name || '',
      //   email: teacherData.email || '',
      //   phone: teacherData.phone || '',
      //   gender: teacherData.gender || 'other',
      //   salary: teacherData.salary || 0,
      //   experience: teacherData.experience || 0,
      //   totalClasses: 0,
      //   dob: teacherData.dob || '',
      //   idCard: teacherData.idCard || '',
      //   joinedDate: teacherData.joinedDate || new Date().toISOString().split('T')[0],
      // };
      // setTeachers((prev) => [...prev, newTeacher]);
    }
    setIsDialogOpen(false);
    setSelectedTeacher(null);
  };

  const handlePaySalary = (teacher: TeacherType) => {
    setTeacherForSalary(teacher);
    setIsSalaryDialogOpen(true);
  };

  const handleConfirmSalaryPayment = (
    teacherId: string,
    salaryData: {
      baseSalary: number;
      bonus: number;
      deduction: number;
      totalAmount: number;
      paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
      paymentDate: string;
      period: string;
      notes: string;
    },
  ) => {
    // TODO: Tạo hóa đơn chi (lương) tự động ở đây
    // Có thể gọi API để tạo salary payment invoice
    console.log('Tạo hóa đơn lương cho giáo viên:', {
      teacherId,
      teacherName: teachers.find((t) => t.id === teacherId)?.fullName,
      ...salaryData,
    });

    setIsSalaryDialogOpen(false);
    setTeacherForSalary(null);

    // Show success message (có thể dùng toast notification)
    alert(`Đã trả lương cho giáo viên thành công!\nSố tiền: ${salaryData.totalAmount.toLocaleString('vi-VN')} VNĐ`);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Teacher Table */}
      <TeacherTable
        teachers={teachers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onPaySalary={handlePaySalary}
        showActions={true}
      />

      {/* Teacher Dialog */}
      <TeacherDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} teacher={selectedTeacher} onSave={handleSave} />

      {/* Salary Payment Dialog */}
      <SalaryPaymentDialog
        open={isSalaryDialogOpen}
        onOpenChange={setIsSalaryDialogOpen}
        teacher={teacherForSalary}
        onConfirm={handleConfirmSalaryPayment}
      />
    </div>
  );
}
