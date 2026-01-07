import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Mail, Phone, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { StudentType } from '@/types/student-type';
import { formatDate } from '@/utils/helper';

interface StudentPersonalInfoProps {
  student: StudentType;
}

export function StudentPersonalInfo({ student }: StudentPersonalInfoProps) {
  const t = useTranslations('student-detail');

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return t('genderMale');
      case 'FEMALE':
        return t('genderFemale');
      case 'OTHER':
        return t('genderOther');
      default:
        return gender;
    }
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="size-5 text-blue-600 dark:text-blue-400" />
          {t('personalInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('name')}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{student.fullName}</p>
        </div>
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-slate-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('email')}: </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{student.email || t('noData')}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-4 text-slate-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('phone')}: </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{student.phoneNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-slate-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('dateOfBirth')}: </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {student.dob ? formatDate(student.dob) : t('noData')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <User className="size-4 text-slate-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('gender')}: </span>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {student.gender ? getGenderLabel(student.gender) : t('noData')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
