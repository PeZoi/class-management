'use client';

import { useMemo, useState, useEffect } from 'react';
import { StudentTable } from './_components/student-table';
import { StudentDialog } from './_components/student-dialog';
import { StudentFilter, FilterState } from './_components/student-filter';
import { PaymentActionDialog } from './_components/payment-action-dialog';
import { StudentRequest, StudentType } from '@/types/student-type';
import { studentService } from '@/services';
import { toast } from 'react-toastify';
import { PageLoading } from '@/components/page-loading';

export interface StudentItem extends StudentType {
  idCard?: string; // ID card number (optional, not in API)
  status: 'active' | 'pending' | 'completed';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  monthlyFee: number;
  amountPaid: number;
  currentMonthPaidAmount?: number; // Số tiền đã đóng tháng hiện tại
}

// Helper function to get current month payment status
const getCurrentMonthPaymentStatus = (
  monthPaymentStatuses?: Array<{
    month: string;
    expectedAmount: number;
    paidAmount: number;
    remainingAmount: number;
    status: 'PAID' | 'PARTIAL' | 'UNPAID';
  }>,
  monthlyFee?: number,
): {
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  paidAmount: number;
  expectedAmount: number;
} => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // Tìm payment status của tháng hiện tại
  if (monthPaymentStatuses && monthPaymentStatuses.length > 0) {
    for (const paymentStatus of monthPaymentStatuses) {
      const paymentDate = new Date(paymentStatus.month);
      const paymentYear = paymentDate.getFullYear();
      const paymentMonth = paymentDate.getMonth() + 1;

      if (paymentYear === currentYear && paymentMonth === currentMonth) {
        // Convert status từ API format (PAID, PARTIAL, UNPAID) sang component format
        const statusMap: Record<'PAID' | 'PARTIAL' | 'UNPAID', 'paid' | 'unpaid' | 'partial'> = {
          PAID: 'paid',
          PARTIAL: 'partial',
          UNPAID: 'unpaid',
        };

        return {
          paymentStatus: statusMap[paymentStatus.status] || 'unpaid',
          paidAmount: paymentStatus.paidAmount || 0,
          expectedAmount: paymentStatus.expectedAmount || monthlyFee || 0,
        };
      }
    }
  }

  // Nếu không tìm thấy tháng hiện tại, trả về unpaid
  return {
    paymentStatus: 'unpaid',
    paidAmount: 0,
    expectedAmount: monthlyFee || 0,
  };
};

// Helper function to map API StudentType to StudentItem
const mapStudentTypeToStudentItem = (student: StudentType, index: number): StudentItem => {
  // Lấy monthly fee từ class hoặc fallback
  const monthlyFee = student.class?.monthlyFee || 4000000 + (index % 2) * 500000;

  // Lấy payment status của tháng hiện tại từ monthPaymentStatuses
  const currentMonthPayment = getCurrentMonthPaymentStatus(student.monthPaymentStatuses, monthlyFee);

  // Set status statically (mostly active)
  const status: 'active' | 'pending' | 'completed' = index % 10 === 0 ? 'pending' : index % 20 === 0 ? 'completed' : 'active';

  return {
    ...student,
    idCard: '', // Not available in API, set empty
    status,
    paymentStatus: currentMonthPayment.paymentStatus,
    monthlyFee,
    amountPaid: currentMonthPayment.paidAmount,
    currentMonthPaidAmount: currentMonthPayment.paidAmount,
  };
};

export default function StudentManagementPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [studentForPayment, setStudentForPayment] = useState<StudentItem | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    paymentStatus: 'all',
    className: 'all',
    gender: 'all',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  // Fetch students from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await studentService.getStudents();
        
        if (response.status === 200 && response.data) {
          const mappedStudents = response.data.map((student: StudentType, index: number) =>
            mapStudentTypeToStudentItem(student, index)
          );
          setStudents(mappedStudents);
        } else {
          toast.error('Không thể tải danh sách học viên');
        }
      } catch (error) {
        console.error('Error fetching students:', error);
        toast.error('Lỗi khi tải danh sách học viên');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (student: StudentItem) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePayment = (student: StudentItem) => {
    setStudentForPayment(student);
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (
    studentId: string,
    paymentData: {
      amount: number;
      paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
      paymentDate: string;
      notes: string;
    },
  ) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const newAmountPaid = s.amountPaid + paymentData.amount;
          let newPaymentStatus: 'paid' | 'unpaid' | 'partial' = 'unpaid';

          if (newAmountPaid >= s.monthlyFee) {
            newPaymentStatus = 'paid';
          } else if (newAmountPaid > 0) {
            newPaymentStatus = 'partial';
          }

          // TODO: Tạo hóa đơn tự động ở đây
          // Có thể gọi API để tạo payment invoice
          console.log('Tạo hóa đơn cho học viên:', {
            studentId: s.id,
            studentName: s.fullName,
            className: s.class?.name || 'Chưa có lớp',
            amount: paymentData.amount,
            paymentMethod: paymentData.paymentMethod,
            paymentDate: paymentData.paymentDate,
            notes: paymentData.notes,
          });

          return {
            ...s,
            amountPaid: newAmountPaid,
            paymentStatus: newPaymentStatus,
          };
        }
        return s;
      }),
    );

    setIsPaymentDialogOpen(false);
    setStudentForPayment(null);
  };

  const handleSave = async (studentData: StudentRequest) => {
    // Helper: reload list after create/update
    const reloadStudents = async () => {
      try {
        const refreshResponse = await studentService.getStudents();
        if (refreshResponse.status === 200 && refreshResponse.data) {
          const mappedStudents = refreshResponse.data.map(
            (student: StudentType, index: number) => mapStudentTypeToStudentItem(student, index),
          );
          setStudents(mappedStudents);
        }
      } catch (error) {
        console.error('Error refreshing students:', error);
      }
    };

    // Update existing student
    if (selectedStudent) {
      try {
        const response = await studentService.updateStudent(studentData, selectedStudent.id);
        if (response.status === 200 && response.data) {
          await reloadStudents();
          toast.success('Cập nhật học viên thành công');
          setIsDialogOpen(false);
          setSelectedStudent(null);
        }
      } catch (error) {
        console.error('Error updating student:', error);
        toast.error('Cập nhật học viên thất bại');
      }
      return;
    }

    // Add new student
    try {
      const response = await studentService.createStudent(studentData);
      if (response.status === 201 && response.data) {
        await reloadStudents();
        toast.success('Thêm học viên thành công');
        setIsDialogOpen(false);
        setSelectedStudent(null);
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error('Thêm học viên thất bại');
    }
  };

  // Get unique class names for filter
  const availableClasses = useMemo(() => {
    const classes = [...new Set(students.map((s) => s.class?.name || 'Chưa có lớp'))];
    return classes.sort();
  }, [students]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = [...students];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (student) =>
          student.fullName.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.phoneNumber.includes(query) ||
          student.fullNameParent.toLowerCase().includes(query) ||
          (student.class?.name || '').toLowerCase().includes(query),
      );
    }

    // Apply payment status filter
    if (filters.paymentStatus !== 'all') {
      result = result.filter((student) => student.paymentStatus === filters.paymentStatus);
    }

    // Apply class filter
    if (filters.className !== 'all') {
      result = result.filter((student) => (student.class?.name || 'Chưa có lớp') === filters.className);
    }

    // Apply gender filter
    if (filters.gender !== 'all') {
      const genderMap: Record<'male' | 'female' | 'other', 'MALE' | 'FEMALE' | 'OTHER'> = {
        male: 'MALE',
        female: 'FEMALE',
        other: 'OTHER',
      };
      result = result.filter((student) => student.gender === genderMap[filters.gender as 'male' | 'female' | 'other']);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'name':
          comparison = a.fullName.localeCompare(b.fullName, 'vi');
          break;
        case 'joinedDate':
          comparison = new Date(a.class?.joinAt || '').getTime() - new Date(b.class?.joinAt || '').getTime();
          break;
        case 'monthlyFee':
          comparison = a.monthlyFee - b.monthlyFee;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, filters]);

  if (isLoading) {
    return <PageLoading message="Đang tải danh sách học viên..." />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Filter and Search */}
      <StudentFilter filters={filters} onFilterChange={setFilters} availableClasses={availableClasses} />

      {/* Student Table */}
      <StudentTable
        students={filteredStudents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onPayment={handlePayment}
        showActions={true}
      />

      {/* Student Dialog */}
      <StudentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        student={selectedStudent}
        onSave={handleSave}
      />

      {/* Payment Dialog */}
      <PaymentActionDialog
        open={isPaymentDialogOpen}
        onOpenChange={setIsPaymentDialogOpen}
        student={studentForPayment}
        onConfirm={handleConfirmPayment}
      />
    </div>
  );
}
