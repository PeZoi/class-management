import { TeacherPersonalInfo } from '@/app/[locale]/teacher-management/[id]/_components/teacher-personal-info';
import { Button } from '@/components/ui/button';
import { TeacherType } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

interface TeacherDetailHeaderProps {
  teacherData: TeacherType;
}

export function TeacherDetailHeader({ teacherData }: TeacherDetailHeaderProps) {
  const t = useTranslations('teacher-detail');
  const locale = useLocale();

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={`/${locale}/teacher-management`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            {t('back') || 'Quay lại'}
          </Button>
        </Link>
      </div>

      {/* Header */}
      <TeacherPersonalInfo teacherData={teacherData} />
    </>
  );
}

