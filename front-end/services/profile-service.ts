import http from '@/lib/http';
import { Profile, ResponseType, UpdateProfileRequest } from '@/types';

export const profileService = {
  getProfile: () => http.get<ResponseType<Profile, Profile>>('/api/profile/me'),
  updateProfile: (data: UpdateProfileRequest) => http.put<ResponseType<Profile, Profile>>('/api/profile/me', data),
};

