import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface StudentDetailHeaderProps {
  studentName: string;
  className?: string;
}

export function StudentDetailHeader({ studentName, className }: StudentDetailHeaderProps) {
  const t = useTranslations('student-detail');
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
          {t('back')}
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="size-16 md:size-20 rounded-2xl flex items-center justify-center shadow-lg bg-linear-to-br from-blue-500 to-purple-600">
            <GraduationCap className="size-8 md:size-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">{studentName}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t('studentInfo')}</p>
            <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {t('statusActive')}
            </Badge>
          </div>
        </div>
      </div>
    </>
  );
}
