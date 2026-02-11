'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useLocale } from 'next-intl';

/**
 * Component để bảo vệ các route, redirect về login nếu chưa đăng nhập
 * Nên đặt component này trong layout để áp dụng cho tất cả các trang
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const [isChecking, setIsChecking] = useState(true);

  // Danh sách các route public (không cần đăng nhập)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const publicRoutes = [`/${locale}/sign-in`];

  useEffect(() => {
    // Đợi một chút để đảm bảo StoreInitializer đã load xong
    const timer = setTimeout(() => {
      const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
      const isAuthenticated = !!user && !!accessToken;

      // Nếu đã đăng nhập và đang ở trang sign-in, redirect dựa trên role
      if (isAuthenticated && isPublicRoute) {
        if (user.role === 'ROLE_TEACHER') {
          router.push(`/${locale}/classroom-management`);
        } else {
          router.push(`/${locale}/dashboard`);
        }
        return;
      }

      // Nếu chưa đăng nhập và không phải route public, redirect về login
      if (!isAuthenticated && !isPublicRoute) {
        window.location.href = `/${locale}/sign-in`;
      }
      
      setIsChecking(false);
    }, 100); // Đợi 100ms để StoreInitializer load xong

    return () => clearTimeout(timer);
  }, [user, accessToken, pathname, locale, router, publicRoutes]);

  // Nếu đang check hoặc chưa đăng nhập và không phải route public, không render children
  if (isChecking) {
    return null; // Hoặc có thể return loading spinner
  }

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAuthenticated = !!user && !!accessToken;

  // Nếu chưa đăng nhập và không phải route public, không render
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
}

