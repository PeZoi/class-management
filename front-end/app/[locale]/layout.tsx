import { AppSidebar } from '@/components/app-sidebar';
import { AuthGuard } from '@/components/auth-guard';
import Header from '@/components/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { locales } from '@/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Providers } from './providers';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });

  return {
    title: t('title_application'),
    description: t('appDescription'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const pathname = (await headers()).get('x-pathname') || '';

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as never)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  // Pages without sidebar/header
  if (pathname.includes('/sign-in')) {
    return (
      <NextIntlClientProvider messages={messages}>
        <Providers>
          <SidebarProvider>
            <AuthGuard>{children}</AuthGuard>
          </SidebarProvider>
        </Providers>
      </NextIntlClientProvider>
    );
  }

  // Normal pages with sidebar and header
  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <SidebarProvider>
          <AuthGuard>
            <AppSidebar />
            <main className="flex-1 w-full max-w-full min-w-0 flex flex-col min-h-0">
              <Header />
              <div className="w-full max-w-full min-w-0 overflow-x-hidden flex-1 overflow-y-auto">{children}</div>
            </main>
          </AuthGuard>
        </SidebarProvider>
      </Providers>
    </NextIntlClientProvider>
  );
}
