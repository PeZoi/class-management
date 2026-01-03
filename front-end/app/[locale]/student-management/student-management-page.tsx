'use client';

import { useMemo, useState } from 'react';
import { StudentTable } from './_components/student-table';
import { StudentDialog } from './_components/student-dialog';
import { StudentFilter, FilterState } from './_components/student-filter';
import { PaymentActionDialog } from './_components/payment-action-dialog';
import { StudentRequest, StudentType } from '@/types/student-type';
import { studentService } from '@/services';
import { toast } from 'react-toastify';

export interface StudentItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string; // date of birth
  gender: 'male' | 'female' | 'other';
  idCard: string; // ID card number
  parentName: string;
  parentPhone: string;
  className: string; // enrolled class
  joinedDate: string;
  status: 'active' | 'pending' | 'completed';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  monthlyFee: number;
  amountPaid: number;
}

// Mock data - trong thực tế sẽ fetch từ API
const initialStudents: StudentItem[] = [
  {
    id: 1,
    name: 'Nguyễn Thị Mai',
    email: 'mainguyen@example.com',
    phone: '0912345678',
    dob: '2005-03-15',
    gender: 'female',
    idCard: '001205012345',
    parentName: 'Nguyễn Văn Hùng',
    parentPhone: '0987654321',
    className: 'JavaScript Nâng Cao',
    joinedDate: '2024-01-15',
    status: 'active',
    paymentStatus: 'paid',
    monthlyFee: 5000000,
    amountPaid: 5000000,
  },
  {
    id: 2,
    name: 'Trần Văn Nam',
    email: 'namtran@example.com',
    phone: '0923456789',
    dob: '2006-07-22',
    gender: 'male',
    idCard: '001206054321',
    parentName: 'Trần Thị Lan',
    parentPhone: '0976543210',
    className: 'React Cơ Bản',
    joinedDate: '2024-02-20',
    status: 'active',
    paymentStatus: 'partial',
    monthlyFee: 4500000,
    amountPaid: 2000000,
  },
  {
    id: 3,
    name: 'Lê Thị Hoa',
    email: 'hoale@example.com',
    phone: '0934567890',
    dob: '2005-11-10',
    gender: 'female',
    idCard: '001205067890',
    parentName: 'Lê Văn Minh',
    parentPhone: '0965432109',
    className: 'Python Căn Bản',
    joinedDate: '2024-03-10',
    status: 'active',
    paymentStatus: 'unpaid',
    monthlyFee: 4000000,
    amountPaid: 0,
  },
  {
    id: 4,
    name: 'Phạm Văn Đức',
    email: 'ducpham@example.com',
    phone: '0945678901',
    dob: '2004-05-18',
    gender: 'male',
    idCard: '001204023456',
    parentName: 'Phạm Thị Hương',
    parentPhone: '0954321098',
    className: 'JavaScript Nâng Cao',
    joinedDate: '2024-01-05',
    status: 'active',
    paymentStatus: 'paid',
    monthlyFee: 5000000,
    amountPaid: 5000000,
  },
  {
    id: 5,
    name: 'Hoàng Thị Linh',
    email: 'linhhoang@example.com',
    phone: '0956789012',
    dob: '2006-12-05',
    gender: 'female',
    idCard: '001206034567',
    parentName: 'Hoàng Văn Tùng',
    parentPhone: '0943210987',
    className: 'React Cơ Bản',
    joinedDate: '2024-02-15',
    status: 'pending',
    paymentStatus: 'unpaid',
    monthlyFee: 4500000,
    amountPaid: 0,
  },
  {
    id: 6,
    name: 'Vũ Văn Hải',
    email: 'haivu@example.com',
    phone: '0967890123',
    dob: '2005-08-25',
    gender: 'male',
    idCard: '001205045678',
    parentName: 'Vũ Thị Nga',
    parentPhone: '0932109876',
    className: 'Python Căn Bản',
    joinedDate: '2023-12-20',
    status: 'completed',
    paymentStatus: 'paid',
    monthlyFee: 4000000,
    amountPaid: 4000000,
  },
];

export default function StudentManagementPage() {
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
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

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (student: StudentItem) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const handlePayment = (student: StudentItem) => {
    setStudentForPayment(student);
    setIsPaymentDialogOpen(true);
  };

  const handleConfirmPayment = (
    studentId: number,
    paymentData: {
      amount: number;
      paymentMethod: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
      paymentDate: string;
      notes: string;
    }
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
            studentName: s.name,
            className: s.className,
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
      })
    );

    setIsPaymentDialogOpen(false);
    setStudentForPayment(null);
  };

  const handleSave = async (studentData: StudentRequest) => {
    if (selectedStudent) {
      // Update existing student
    } else {
      // Add new student
      try {
        const response = await studentService.createStudent(studentData);
        if (response.status === 200 && response.data) {
          // setStudents((prev) => [...prev, response.data]);
          toast.success('Thêm học viên thành công');
          setIsDialogOpen(false);
          setSelectedStudent(null);
        }
      } catch (error) {
        console.error('Error creating student:', error);
        toast.error('Thêm học viên thất bại');
      }
    }
  };

  // Get unique class names for filter
  const availableClasses = useMemo(() => {
    const classes = [...new Set(students.map((s) => s.className))];
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
          student.name.toLowerCase().includes(query) ||
          student.email.toLowerCase().includes(query) ||
          student.phone.includes(query) ||
          student.parentName.toLowerCase().includes(query) ||
          student.className.toLowerCase().includes(query)
      );
    }

    // Apply payment status filter
    if (filters.paymentStatus !== 'all') {
      result = result.filter((student) => student.paymentStatus === filters.paymentStatus);
    }

    // Apply class filter
    if (filters.className !== 'all') {
      result = result.filter((student) => student.className === filters.className);
    }

    // Apply gender filter
    if (filters.gender !== 'all') {
      result = result.filter((student) => student.gender === filters.gender);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'vi');
          break;
        case 'joinedDate':
          comparison = new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
          break;
        case 'monthlyFee':
          comparison = a.monthlyFee - b.monthlyFee;
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [students, filters]);

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Filter and Search */}
      <StudentFilter
        filters={filters}
        onFilterChange={setFilters}
        availableClasses={availableClasses}
      />

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
        student={selectedStudent as StudentType | null}
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

