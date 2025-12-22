'use client';

import { LanguageSwitcher } from '@/components/language-switcher';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Album, CreditCard, GraduationCap, LayoutDashboard, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AppSidebar() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();

  // Menu items.
  const items = [
    {
      title: t('dashboard'),
      url: `/${locale}`,
      icon: LayoutDashboard,
    },
    {
      title: t('Class Management'),
      url: `/${locale}/classroom-management`,
      icon: Album,
    },
    {
      title: t('Student Management'),
      url: `/${locale}/student-management`,
      icon: GraduationCap,
    },
    {
      title: t('Teacher Management'),
      url: `/${locale}/teacher-management`,
      icon: User,
    },
    {
      title: t('Payment Management'),
      url: `/${locale}/payment-management`,
      icon: CreditCard,
    },
  ];

  // Check if a menu item is active
  const isActive = (url: string) => {
    if (url === `/${locale}`) {
      return pathname === `/${locale}` || pathname === `/${locale}/dashboard`;
    }
    return pathname.startsWith(url);
  };

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between">
        <SidebarGroup>
          <SidebarGroupLabel className="mb-4 mt-2">
            <div className="text-lg font-bold text-center w-full text-black">{t('title_application')}</div>
          </SidebarGroupLabel>
          <Separator className="mb-4" />
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mb-2">
          <SidebarGroupContent>
            <LanguageSwitcher />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
