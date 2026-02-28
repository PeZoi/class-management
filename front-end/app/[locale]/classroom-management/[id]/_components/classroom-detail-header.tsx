import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface ClassroomDetailHeaderProps {
  classData: {
    id: number;
    name: string;
    description: string;
    color: string;
  };
}

export function ClassroomDetailHeader({ classData }: ClassroomDetailHeaderProps) {
  const t = useTranslations('classroom-detail');
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
          <div
            className="size-16 md:size-20 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: classData.color }}
          >
            <BookOpen className="size-8 md:size-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">{classData.name}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{classData.description}</p>
          </div>
        </div>
      </div>
    </>
  );
}
