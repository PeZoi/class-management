import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

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
  const locale = useLocale();

  return (
    <>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link href={`/${locale}/classroom-management`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="size-4" />
            {t('back')}
          </Button>
        </Link>
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
            <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</Badge>
          </div>
        </div>
      </div>
    </>
  );
}
