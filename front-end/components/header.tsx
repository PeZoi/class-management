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
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';

const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://github.com/shadcn.png',
  role: 'Admin',
};
const isLoggedIn = true;

export default function Header() {
  const t = useTranslations('common');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left Section - Menu Toggle & Title */}
        <div className="flex items-center gap-3">
          <SidebarTrigger className="size-9 lg:size-7" />
          <h1 className="text-lg font-bold lg:hidden">{t('title_application')}</h1>
        </div>

        {/* Right Section - Auth/User Actions */}
        <div className="flex items-center gap-2 lg:gap-3">
          {!isLoggedIn ? (
            // Chưa đăng nhập
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Đăng nhập</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Đăng ký</Link>
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
                          alt={user.name}
                          width={32}
                          height={32}
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm">{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-sm font-medium">{user?.name || 'User'}</span>
                      <span className="text-xs text-muted-foreground capitalize">{user?.role || 'Member'}</span>
                    </div>
                    <ChevronDown className="hidden lg:block size-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 size-4" />
                      Hồ sơ cá nhân
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 size-4" />
                      Cài đặt
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 size-4" />
                    Đăng xuất
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
