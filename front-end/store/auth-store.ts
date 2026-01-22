import { UserType } from "@/types";
import { create } from "zustand";
import { profileService } from "@/services/profile-service";
import { HttpError } from "@/lib/http";

interface AuthState {
  user: UserType | null;
  accessToken: string | null;
  setUser: (user: UserType) => void;
  setAccessToken: (accessToken: string) => void;
  loadDataFromLocalStorage: () => void;
  handleLoginSuccess: (user: UserType, accessToken: string) => void;
  logout: () => void;
  fetchAndSetUserProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setUser: (user: UserType) => set({ user }),
  setAccessToken: (accessToken: string) => set({ accessToken }),
  handleLoginSuccess: (user: UserType, accessToken: string) => {
    set({ user, accessToken });
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    // Lưu vào cookie để server component có thể đọc
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `accessToken=${accessToken}; expires=${expires}; path=/`;
    window.location.href = '/dashboard';
  },
  loadDataFromLocalStorage: () => {
    const user = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    if (user && accessToken) {
      set({ user: JSON.parse(user) as UserType, accessToken });
    }
  },
  logout: () => {
    set({ user: null, accessToken: null });
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    window.location.href = '/sign-in';
  },
  fetchAndSetUserProfile: async () => {
    const accessToken = localStorage.getItem('accessToken');
    // Chỉ gọi API nếu có token
    if (!accessToken) {
      return;
    }

    try {
      const response = await profileService.getProfile();
      if (response.data) {
        // Convert Profile to UserType (Profile có thêm dob, createdAt, updatedAt)
        const user: UserType = {
          id: response.data.id,
          fullName: response.data.fullName,
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          idCard: response.data.idCard,
          avatar: response.data.avatar,
          gender: response.data.gender,
          role: '', // Profile không có role, giữ nguyên role từ localStorage nếu có
        };
        
        // Giữ nguyên role từ user hiện tại nếu có
        const currentUser = localStorage.getItem('user');
        if (currentUser) {
          try {
            const parsedUser = JSON.parse(currentUser) as UserType;
            if (parsedUser.role) {
              user.role = parsedUser.role;
            }
          } catch {
            // Ignore parse error
          }
        }

        set({ user });
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (error) {
      // Nếu lỗi 401 (token hết hạn), http.ts đã xử lý redirect và xóa localStorage
      // Chỉ cần clear state trong zustand để đảm bảo đồng bộ
      if (error instanceof HttpError && error.status === 401) {
        set({ user: null, accessToken: null });
        // Không cần gọi logout() vì http.ts đã redirect rồi
        return;
      }
      // Các lỗi khác thì throw lại để component có thể xử lý nếu cần
      throw error;
    }
  },
}));