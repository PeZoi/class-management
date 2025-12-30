import http from "@/lib/http";
import { LoginRequest, LoginResponseType } from "@/types";

export const authService = {
  login: (data: LoginRequest) => http.post<LoginResponseType>('/api/auth/login', data),
};