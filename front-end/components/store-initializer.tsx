'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Component để khởi tạo store từ localStorage khi app load
 * Nên đặt component này ở root layout để chạy mỗi khi refresh
 */
export function StoreInitializer() {
  const loadDataFromLocalStorage = useAuthStore((state) => state.loadDataFromLocalStorage);

  useEffect(() => {
    // Chỉ load một lần khi component mount (khi app refresh)
    loadDataFromLocalStorage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps để chỉ chạy một lần khi mount

  // Component này không render gì, chỉ để chạy side effect
  return null;
}

