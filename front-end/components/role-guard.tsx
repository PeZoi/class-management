'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useLocale } from 'next-intl';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

/**
 * Component để bảo vệ các route dựa trên role
 * Nếu user không có role phù hợp, redirect về trang 403
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const user = useAuthStore((state) => state.user);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Đợi một chút để đảm bảo StoreInitializer đã load xong
    const timer = setTimeout(() => {
      if (!user) {
        // Nếu chưa có user, không redirect (AuthGuard sẽ xử lý)
        setIsChecking(false);
        return;
      }

      const userRole = user.role;
      const hasAccess = allowedRoles.includes(userRole);

      // Nếu không có quyền truy cập, redirect về trang 403
      if (!hasAccess) {
        router.push(`/${locale}/forbidden`);
        return;
      }

      setIsChecking(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [user, allowedRoles, router, locale, pathname]);

  // Nếu đang check, không render children
  if (isChecking) {
    return null;
  }

  // Nếu không có user, không render (AuthGuard sẽ xử lý)
  if (!user) {
    return null;
  }

  const userRole = user.role;
  const hasAccess = allowedRoles.includes(userRole);

  // Nếu không có quyền, không render
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

