'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useScrollToTopOnRouteChange } from '@/hooks/use-scroll-to-top';
import { GlobalSearchBar } from '@/components/global-search-bar';

export default function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const { user, logout } = useAuthStore();

  // Scroll to top whenever route changes
  useScrollToTopOnRouteChange();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6 lg:px-8">
        {/* Left Section - Menu Toggle & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <SidebarTrigger className="size-9 lg:size-7" />
          <h1 className="text-lg font-bold lg:hidden">{t('title_application')}</h1>
        </div>

        {/* Center Section - Search Bar (only when logged in) */}
        {user && (
          <div className="hidden md:flex flex-1 justify-center max-w-2xl">
            <GlobalSearchBar />
          </div>
        )}

        {/* Right Section - Auth/User Actions */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0">
          {!user ? (
            // Chưa đăng nhập
            <>
              <Button size="sm" onClick={() => (window.location.href = `/${locale}/sign-in`)}>
                {t('login')}
              </Button>
            </>
          ) : (
            // Đã đăng nhập
            <>
              {/* Notification Bell */}
              <Button variant="ghost" size="icon" className="relative size-9 lg:size-10">
                <Bell className="size-5" />
                <span className="absolute top-1.5 right-1.5 size-2 bg-destructive rounded-full" />
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 lg:px-3 h-9 lg:h-10">
                    <div
                      className={cn(
                        'flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-medium shrink-0',
                      )}
                    >
                      {user?.avatar ? (
                        <Image
                          src={user.avatar}
                          alt={user.fullName}
                          width={32}
                          height={32}
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">{user?.fullName?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{user?.fullName || t('user')}</span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {user?.role === 'ROLE_ADMIN' ? t('admin') : t('teacher')}
                      </span>
                    </div>
                    <ChevronDown className="hidden lg:block size-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.fullName || t('user')}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/profile`} className="cursor-pointer">
                      <User className="mr-2 size-4" />
                      {t('Profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/${locale}/settings`} className="cursor-pointer">
                      <Settings className="mr-2 size-4" />
                      {t('settings')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => {
                      logout();
                    }}
                  >
                    <LogOut className="mr-2 size-4" />
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
