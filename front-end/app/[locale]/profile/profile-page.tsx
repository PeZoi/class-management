'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Users, 
  DollarSign,
  Edit,
  TrendingUp
} from 'lucide-react';
import { EditProfileDialog } from './_components/edit-profile-dialog';
import { TeacherSalaryHistory } from '@/app/[locale]/teacher-management/[id]/_components';
import { PersonalInfoCard } from '@/components/personal-info-card';
import { PageLoading } from '@/components/page-loading';
import { profileService, classService } from '@/services';
import { paymentService } from '@/services/payment-service';
import { Profile, UpdateProfileRequest, PaymentResponse } from '@/types';
import { SalaryPayment } from '@/types/teacher-type';
import { ClassType } from '@/types/class-type';
import { formatCurrency } from '@/utils/helper';
import { toast } from 'react-toastify';
import { HttpError } from '@/lib/http';
import { useMemo } from 'react';

// Convert PaymentResponse to SalaryPayment
const convertToSalaryPayment = (payment: PaymentResponse): SalaryPayment => {
  const billingDate = new Date(payment.billingMonth);
  const month = billingDate.getMonth() + 1;
  const year = billingDate.getFullYear();
  const period = `Tháng ${month}/${year}`;

  // Convert payment method
  const paymentMethodMap: Record<string, 'cash' | 'bank_transfer'> = {
    CASH: 'cash',
    BANK_TRANSFER: 'bank_transfer',
  };

  // Convert payment status
  const statusMap: Record<string, 'paid' | 'partial'> = {
    COMPLETED: 'paid',
    INCOMPLETE: 'partial',
  };

  return {
    id: payment.id || payment.paymentId,
    invoiceId: payment.paymentId || `PAY-${payment.id}`,
    paymentDate: payment.createdAt || new Date().toISOString(),
    period,
    baseSalary: payment.feeSnapshot || 0,
    bonus: payment.bonus || 0,
    deduction: payment.deduction || 0,
    totalAmount: (payment.feeSnapshot || 0) + (payment.bonus || 0) - (payment.deduction || 0),
    paymentMethod: paymentMethodMap[payment.paymentMethod] || 'bank_transfer',
    status: statusMap[payment.paymentStatus] || 'partial',
    notes: payment.note,
  };
};

export default function ProfilePage() {
  const t = useTranslations('profile');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [paymentHistory, setPaymentHistory] = useState<PaymentResponse[]>([]);
  const [classes, setClasses] = useState<ClassType[]>([]);

  // Convert payment history to SalaryPayment format for history table
  const salaryHistoryData = useMemo(() => {
    return paymentHistory.map(convertToSalaryPayment);
  }, [paymentHistory]);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const profileResponse = await profileService.getProfile();
      
      if (profileResponse.status === 200 && profileResponse.data) {
        setProfile(profileResponse.data);
        
        // Fetch payments and classes after getting profile (need profile.id)
        if (profileResponse.data.id) {
          // Fetch payment history
          try {
            const teacherPaymentsResponse = await paymentService.getPaymentsByTeacherId(profileResponse.data.id);
            if (teacherPaymentsResponse.status === 200 && teacherPaymentsResponse.data) {
              // Filter only TEACHER_SALARY payments and sort by createdAt desc
              const teacherPayments = teacherPaymentsResponse.data
                .filter((p: PaymentResponse) => p.paymentType === 'TEACHER_SALARY')
                .sort((a: PaymentResponse, b: PaymentResponse) => {
                  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return dateB - dateA;
                });
              setPaymentHistory(teacherPayments);
            }
          } catch (paymentError) {
            console.error('Error fetching payment history:', paymentError);
            // Don't show error toast for payment history, just log it
          }

          // Fetch classes
          try {
            const classesResponse = await classService.getClassesByTeacherId(profileResponse.data.id);
            if (classesResponse.status === 200 && classesResponse.data) {
              setClasses(classesResponse.data);
            }
          } catch (classesError) {
            console.error('Error fetching classes:', classesError);
            // Don't show error toast for classes, just log it
          }
        }
      } else {
        toast.error(t('errorLoadProfile'));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(t('errorLoadProfile'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (updatedData: UpdateProfileRequest) => {
    try {
      setFieldErrors({});
      const response = await profileService.updateProfile(updatedData);
      if (response.status === 200 && response.data) {
        setProfile(response.data);
        setIsEditDialogOpen(false);
        setFieldErrors({});
        toast.success(t('successUpdateProfile'));
      } else {
        toast.error(t('errorUpdateProfile'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Handle validation errors
      if (error instanceof HttpError) {
        const errorMessage = error.payload?.message;
        
        // Check if it's a duplicate error message
        if (typeof errorMessage === 'string') {
          const errors: Record<string, string> = {};
          if (errorMessage.includes('Email') || errorMessage.toLowerCase().includes('email')) {
            errors.email = t('errorEmailExists');
          } else if (errorMessage.includes('Số điện thoại') || errorMessage.includes('phone') || errorMessage.toLowerCase().includes('phone')) {
            errors.phoneNumber = t('errorPhoneExists');
          } else if (errorMessage.includes('Căn cước') || errorMessage.includes('idCard') || errorMessage.toLowerCase().includes('căn cước')) {
            errors.idCard = t('errorIdCardExists');
          } else if (errorMessage.includes('mật khẩu hiện tại') || errorMessage.includes('current password') || errorMessage.toLowerCase().includes('current password')) {
            if (errorMessage.includes('không đúng') || errorMessage.includes('incorrect') || errorMessage.toLowerCase().includes('incorrect')) {
              errors.currentPassword = t('errorCurrentPasswordIncorrect');
            } else {
              errors.currentPassword = t('errorCurrentPasswordRequired');
            }
          }
          
          if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
          } else {
            toast.error(errorMessage || t('errorUpdateProfile'));
          }
        } else {
          toast.error(t('errorUpdateProfile'));
        }
      } else {
        toast.error(t('errorUpdateProfile'));
      }
      // Re-throw to prevent dialog from closing
      throw error;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatGender = (gender: string | null) => {
    if (!gender) return '';
    const genderMap: Record<string, string> = {
      MALE: t('gender_male'),
      FEMALE: t('gender_female'),
      OTHER: t('gender_other'),
    };
    return genderMap[gender] || gender;
  };

  // Calculate statistics
  const totalRevenue = useMemo(() => {
    return paymentHistory.reduce((sum, payment) => {
      const totalAmount = (payment.feeSnapshot || 0) + (payment.bonus || 0) - (payment.deduction || 0);
      return sum + totalAmount;
    }, 0);
  }, [paymentHistory]);

  const activeClassesCount = useMemo(() => {
    return classes.length;
  }, [classes]);

  const totalStudentsCount = useMemo(() => {
    return classes.reduce((sum, classItem) => sum + (classItem.studentCount || 0), 0);
  }, [classes]);

  const thisMonthSalary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return paymentHistory
      .filter((payment) => {
        if (!payment.billingMonth) return false;
        const billingDate = new Date(payment.billingMonth);
        return billingDate.getMonth() === currentMonth && billingDate.getFullYear() === currentYear;
      })
      .reduce((sum, payment) => {
        const totalAmount = (payment.feeSnapshot || 0) + (payment.bonus || 0) - (payment.deduction || 0);
        return sum + totalAmount;
      }, 0);
  }, [paymentHistory]);

  if (isLoading) {
    return <PageLoading />;
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">{t('errorLoadProfile')}</div>
      </div>
    );
  }

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
        name={profile.fullName}
        avatar={profile.avatar || undefined}
        email={profile.email}
        phone={profile.phoneNumber}
        dob={formatDate(profile.dob)}
        idCard={profile.idCard}
        gender={formatGender(profile.gender)}
        joinedDate={formatDate(profile.createdAt)}
        address=""
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tổng doanh thu từ trước đến giờ */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalEarnings')}</CardTitle>
            <DollarSign className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('totalEarnings')}
            </p>
          </CardContent>
        </Card>

        {/* Tổng số lớp đang dạy */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalClasses')}</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClassesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('activeClasses')}
            </p>
          </CardContent>
        </Card>

        {/* Tổng số học viên đang dạy */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalStudents')}</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudentsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('students')}</p>
          </CardContent>
        </Card>

        {/* Tổng lương tháng này */}
        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('thisMonth')}</CardTitle>
            <TrendingUp className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(thisMonthSalary)}</div>
            <p className="text-xs text-muted-foreground mt-1">{t('thisMonth')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Payment History Table */}
      <TeacherSalaryHistory salaryHistory={salaryHistoryData} isProfile={true} />

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setFieldErrors({});
          }
        }}
        profile={profile}
        onSave={handleSaveProfile}
        fieldErrors={fieldErrors}
      />
    </div>
  );
}
