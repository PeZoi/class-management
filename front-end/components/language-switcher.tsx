'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import VNFlag from '@/public/flags/vn-flag.png';
import UKFlag from '@/public/flags/uk-flag.png';
import Image from 'next/image';

const localeNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

const localeFlags: Record<Locale, string> = {
  vi: VNFlag.src as string,
  en: UKFlag.src as string,
};

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    // Thay thế locale trong URL
    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] && locales.includes(segments[0] as Locale)) {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }
    router.push(`/${segments.join('/')}`);
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full justify-between data-[state=open]:bg-sidebar-accent cursor-pointer">
              <div className="flex items-center gap-2">
                <Image src={localeFlags[locale] as string} alt={locale} width={20} height={20} />
                <span className="font-medium">{localeNames[locale]}</span>
              </div>
              <ChevronDown className="size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" sideOffset={8} className="min-w-40">
            {locales.map((loc) => {
              const isActive = loc === locale;
              return (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => !isActive && switchLocale(loc)}
                  className={cn('cursor-pointer', isActive && 'bg-accent font-medium')}
                >
                  <Image src={localeFlags[loc] as string} alt={loc} width={20} height={20} />
                  <span className="flex-1">{localeNames[loc]}</span>
                  {isActive && <Check className="size-4 ml-2" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
