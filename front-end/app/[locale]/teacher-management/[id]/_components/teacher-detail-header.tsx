import { TeacherPersonalInfo } from '@/app/[locale]/teacher-management/[id]/_components/teacher-personal-info';
import { Button } from '@/components/ui/button';
import { TeacherType } from '@/types';
import { ArrowLeft } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface TeacherDetailHeaderProps {
  teacherData: TeacherType;
}

export function TeacherDetailHeader({ teacherData }: TeacherDetailHeaderProps) {
  const t = useTranslations('teacher-detail');
  const locale = useLocale();
  const router = useRouter();

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="size-4" />
          {t('back') || 'Quay lại'}
        </Button>
      </div>

      {/* Header */}
      <TeacherPersonalInfo teacherData={teacherData} />
    </>
  );
}

