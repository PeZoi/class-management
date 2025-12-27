'use client';

import { useState } from 'react';
import { TeacherTable } from './_components/teacher-table';
import { TeacherDialog } from './_components/teacher-dialog';

interface TeacherItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  salary: number;
  experience: number; // years of experience
  totalClasses: number;
  dob: string; // date of birth
  idCard: string; // ID card number
  joinedDate: string;
}

// Mock data - trong thực tế sẽ fetch từ API
const initialTeachers: TeacherItem[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0912345678',
    salary: 15000000, // 15 triệu/tháng
    experience: 5,
    totalClasses: 3,
    dob: '1990-05-15',
    idCard: '001090012345',
    joinedDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    phone: '0987654321',
    salary: 18000000, // 18 triệu/tháng
    experience: 8,
    totalClasses: 2,
    dob: '1987-08-22',
    idCard: '001087054321',
    joinedDate: '2023-03-20',
  },
  {
    id: 3,
    name: 'Lê Văn C',
    email: 'levanc@example.com',
    phone: '0901234567',
    salary: 12000000, // 12 triệu/tháng
    experience: 3,
    totalClasses: 2,
    dob: '1994-11-10',
    idCard: '001094067890',
    joinedDate: '2023-05-10',
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    phone: '0923456789',
    salary: 20000000, // 20 triệu/tháng
    experience: 10,
    totalClasses: 1,
    dob: '1985-03-18',
    idCard: '001085023456',
    joinedDate: '2023-07-01',
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    email: 'hoangvane@example.com',
    phone: '0934567890',
    salary: 16000000, // 16 triệu/tháng
    experience: 6,
    totalClasses: 2,
    dob: '1989-12-05',
    idCard: '001089034567',
    joinedDate: '2023-09-15',
  },
];

export default function TeacherManagementPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>(initialTeachers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherItem | null>(null);


  const handleAdd = () => {
    setSelectedTeacher(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (teacher: TeacherItem) => {
    setSelectedTeacher(teacher);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSave = (teacherData: Partial<TeacherItem>) => {
    if (selectedTeacher) {
      // Update existing teacher
      setTeachers((prev) =>
        prev.map((t) => (t.id === selectedTeacher.id ? { ...t, ...teacherData } : t))
      );
    } else {
      // Add new teacher
      const newTeacher: TeacherItem = {
        id: Math.max(...teachers.map((t) => t.id)) + 1,
        name: teacherData.name || '',
        email: teacherData.email || '',
        phone: teacherData.phone || '',
        salary: teacherData.salary || 0,
        experience: teacherData.experience || 0,
        totalClasses: 0,
        dob: teacherData.dob || '',
        idCard: teacherData.idCard || '',
        joinedDate: teacherData.joinedDate || new Date().toISOString().split('T')[0],
      };
      setTeachers((prev) => [...prev, newTeacher]);
    }
    setIsDialogOpen(false);
    setSelectedTeacher(null);
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Teacher Table */}
      <TeacherTable
        teachers={teachers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        showActions={true}
      />

      {/* Teacher Dialog */}
      <TeacherDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        teacher={selectedTeacher}
        onSave={handleSave}
      />
    </div>
  );
}
