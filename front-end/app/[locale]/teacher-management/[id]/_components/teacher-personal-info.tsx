import { PersonalInfoCard } from '@/components/personal-info-card';
import { useTranslations } from 'next-intl';

interface TeacherPersonalInfoProps {
  teacherData: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    idCard: string;
    dob: string;
    gender: string;
    createdAt: string;
    avatar?: string;
  };
}

export function TeacherPersonalInfo({ teacherData }: TeacherPersonalInfoProps) {
  const t = useTranslations('teacher-detail');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDOB = (dob: string) => {
    const date = new Date(dob);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return t('male') || 'Nam';
      case 'FEMALE':
        return t('female') || 'Nữ';
      case 'OTHER':
        return t('other') || 'Khác';
      default:
        return gender;
    }
  };

  return (
    <PersonalInfoCard
      title={t('personalInfo') || 'Thông tin cá nhân'}
      name={teacherData.fullName}
      avatar={teacherData.avatar}
      email={teacherData.email}
      phone={teacherData.phoneNumber}
      idCard={teacherData.idCard}
      dob={formatDOB(teacherData.dob)}
      gender={getGenderLabel(teacherData.gender)}
      joinedDate={formatDate(teacherData.createdAt)}
    />
  );
}
