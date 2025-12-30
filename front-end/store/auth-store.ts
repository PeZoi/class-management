import { UserType } from "@/types";
import { create } from "zustand";

interface AuthState {
  user: UserType | null;
  accessToken: string | null;
  setUser: (user: UserType) => void;
  setAccessToken: (accessToken: string) => void;
  loadDataFromLocalStorage: () => void;
  handleLoginSuccess: (user: UserType, accessToken: string) => void;
  logout: () => void;
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
}));