import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getTranslations, getLocale } from 'next-intl/server';
import { Home, Search } from 'lucide-react';

export async function generateMetadata() {
  const t = await getTranslations('notFound');
  return {
    title: t('title'),
  };
}

export default async function NotFound() {
  const t = await getTranslations('notFound');
  const locale = await getLocale();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-16">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Number */}
        <div className="space-y-2">
          <h1 className="text-9xl font-bold text-primary/20 dark:text-primary/10">404</h1>
          <div className="h-1 w-24 bg-linear-to-r from-primary to-primary/50 mx-auto rounded-full" />
        </div>

        {/* Title and Description */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground text-lg">{t('description')}</p>
          <p className="text-sm text-muted-foreground">{t('message')}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={`/${locale}`}>
              <Home className="mr-2 size-4" />
              {t('goHome')}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href={`/${locale}/dashboard`}>
              <Search className="mr-2 size-4" />
              {t('goToDashboard')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

