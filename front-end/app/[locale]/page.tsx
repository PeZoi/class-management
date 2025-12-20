import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const t = await getTranslations('page');

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Button>{t('button')}</Button>
    </div>
  );
}
