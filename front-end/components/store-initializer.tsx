'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

/**
 * Component để khởi tạo store từ localStorage khi app load
 * Và gọi API /api/profile/me để cập nhật user info và kiểm tra token hết hạn
 * Nên đặt component này ở root layout để chạy mỗi khi refresh
 */
export function StoreInitializer() {
  const loadDataFromLocalStorage = useAuthStore((state) => state.loadDataFromLocalStorage);
  const fetchAndSetUserProfile = useAuthStore((state) => state.fetchAndSetUserProfile);

  useEffect(() => {
    // Load data từ localStorage trước
    loadDataFromLocalStorage();
    
    // Sau đó gọi API để cập nhật user info và kiểm tra token
    // Nếu token hết hạn, API sẽ trả về 401 và logout sẽ được gọi tự động
    fetchAndSetUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return null;
}

