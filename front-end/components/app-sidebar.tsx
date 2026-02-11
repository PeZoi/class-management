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
import { useAuthStore } from '@/store';

export function AppSidebar() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const { user } = useAuthStore();


  // Menu items - filter based on role
  const allItems = [
    {
      title: t('dashboard'),
      url: `/${locale}`,
      icon: LayoutDashboard,
      roles: ['ROLE_ADMIN'],
    },
    {
      title: t('Class Management'),
      url: `/${locale}/classroom-management`,
      icon: Album,
      roles: ['ROLE_ADMIN', 'ROLE_TEACHER'],
    },
    {
      title: t('Student Management'),
      url: `/${locale}/student-management`,
      icon: GraduationCap,
      roles: ['ROLE_ADMIN'],
    },
    {
      title: t('Teacher Management'),
      url: `/${locale}/teacher-management`,
      icon: User,
      roles: ['ROLE_ADMIN'],
    },
    {
      title: t('Payment Management'),
      url: `/${locale}/payment-management`,
      icon: CreditCard,
      roles: ['ROLE_ADMIN'],
    },
  ];

  // Filter menu items based on user role
  const items = allItems.filter((item) => {
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  });

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
              {items.map((item) => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      className={
                        active
                          ? 'bg-linear-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 border-l-4 border-blue-600 dark:border-blue-400 text-blue-700 dark:text-blue-300 hover:from-blue-500/20 hover:to-purple-500/20 dark:hover:from-blue-500/30 dark:hover:to-purple-500/30 font-semibold shadow-sm'
                          : ''
                      }
                    >
                      <Link href={item.url}>
                        <item.icon className={active ? 'text-blue-600 dark:text-blue-400' : ''} />
                        <span className="text-sm">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
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
