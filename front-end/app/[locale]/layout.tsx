import { AppSidebar } from '@/components/app-sidebar';
import Header from '@/components/header';
import { SidebarProvider } from '@/components/ui/sidebar';
import { locales } from '@/i18n';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
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

  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as never)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1 w-full">
          <Header />
          <div className="w-full">{children}</div>
        </main>
      </SidebarProvider>
    </NextIntlClientProvider>
  );
}
