'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  DollarSign,
  Edit,
  Award
} from 'lucide-react';
import { EditProfileDialog } from './_components/edit-profile-dialog';
import { SalaryHistoryTable } from './_components/salary-history-table';
import { PersonalInfoCard } from '@/components/personal-info-card';

// Mock data - trong thực tế sẽ fetch từ API hoặc authentication context
interface TeacherProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  dob: string;
  idCard: string;
  experience: number;
  baseSalary: number;
  joinedDate: string;
  address: string;
  bio: string;
  avatar?: string;
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  totalEarnings: number;
  monthlyEarnings: number;
}

interface SalaryPayment {
  id: number;
  paymentDate: string;
  period: string;
  baseSalary: number;
  bonus: number;
  deduction: number;
  totalAmount: number;
  status: 'paid' | 'pending';
  method: 'cash' | 'bank_transfer' | 'credit_card' | 'e_wallet';
  notes: string;
}

const mockTeacher: TeacherProfile = {
  id: 1,
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0912345678',
  dob: '1990-05-15',
  idCard: '001090012345',
  experience: 5,
  baseSalary: 15000000,
  joinedDate: '2023-01-15',
  address: '123 Đường ABC, Quận 1, TP.HCM',
  bio: 'Giáo viên có 5 năm kinh nghiệm giảng dạy lập trình web và mobile. Đam mê công nghệ và luôn cập nhật kiến thức mới.',
  totalClasses: 12,
  activeClasses: 3,
  totalStudents: 156,
  totalEarnings: 90000000,
  monthlyEarnings: 15000000,
};

const mockSalaryPayments: SalaryPayment[] = [
  {
    id: 1,
    paymentDate: '2024-12-01',
    period: 'Tháng 11/2024',
    baseSalary: 15000000,
    bonus: 2000000,
    deduction: 500000,
    totalAmount: 16500000,
    status: 'paid',
    method: 'bank_transfer',
    notes: 'Thưởng hiệu suất tháng 11',
  },
  {
    id: 2,
    paymentDate: '2024-11-01',
    period: 'Tháng 10/2024',
    baseSalary: 15000000,
    bonus: 0,
    deduction: 0,
    totalAmount: 15000000,
    status: 'paid',
    method: 'bank_transfer',
    notes: '',
  },
  {
    id: 3,
    paymentDate: '2024-10-01',
    period: 'Tháng 9/2024',
    baseSalary: 15000000,
    bonus: 1000000,
    deduction: 0,
    totalAmount: 16000000,
    status: 'paid',
    method: 'bank_transfer',
    notes: 'Thưởng khai giảng lớp mới',
  },
  {
    id: 4,
    paymentDate: '2024-09-01',
    period: 'Tháng 8/2024',
    baseSalary: 15000000,
    bonus: 0,
    deduction: 0,
    totalAmount: 15000000,
    status: 'paid',
    method: 'bank_transfer',
    notes: '',
  },
  {
    id: 5,
    paymentDate: '2024-08-01',
    period: 'Tháng 7/2024',
    baseSalary: 15000000,
    bonus: 500000,
    deduction: 0,
    totalAmount: 15500000,
    status: 'paid',
    method: 'bank_transfer',
    notes: 'Thưởng chuyên cần',
  },
];

export default function ProfilePage() {
  const t = useTranslations('profile');
  const [teacher, setTeacher] = useState<TeacherProfile>(mockTeacher);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [salaryPayments] = useState<SalaryPayment[]>(mockSalaryPayments);

  const handleSaveProfile = (updatedData: Partial<TeacherProfile>) => {
    setTeacher((prev) => ({ ...prev, ...updatedData }));
    setIsEditDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 min-h-screen">
      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">{t('description')}</p>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)} className="gap-2">
          <Edit className="h-4 w-4" />
          {t('editProfile')}
        </Button>
      </div>

      {/* Profile Header Card */}
      <PersonalInfoCard
        title={t('personalInfo')}
        name={teacher.name}
        avatar={teacher.avatar}
        email={teacher.email}
        phone={teacher.phone}
        dob={formatDate(teacher.dob)}
        idCard={teacher.idCard}
        address={teacher.address}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalClasses')}</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.totalClasses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {teacher.activeClasses} {t('activeClasses').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalStudents')}</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('students')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('experience')}</CardTitle>
            <Award className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teacher.experience}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('years')}</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('baseSalary')}</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(teacher.baseSalary / 1000000).toFixed(1)}M
            </div>
            <p className="text-xs text-muted-foreground mt-1">{t('perMonth')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Payment History Table */}
      <SalaryHistoryTable payments={salaryPayments} />

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        teacher={teacher}
        onSave={handleSaveProfile}
      />
    </div>
  );
}
