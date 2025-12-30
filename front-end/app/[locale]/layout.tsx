import { AppSidebar } from '@/components/app-sidebar';
import { AuthGuard } from '@/components/auth-guard';
import Header from '@/components/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { locales } from '@/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
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
        <SidebarProvider>
          <AuthGuard>{children}</AuthGuard>
        </SidebarProvider>
      </NextIntlClientProvider>
    );
  }

  // Normal pages with sidebar and header
  return (
    <NextIntlClientProvider messages={messages}>
      <SidebarProvider>
        <AuthGuard>
          <AppSidebar />
          <main className="flex-1 w-full">
            <Header />
            <div className="w-full">{children}</div>
          </main>
        </AuthGuard>
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}
