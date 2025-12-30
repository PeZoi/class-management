import { ResponseType } from "@/types/response-type";

export interface UserType {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  idCard: string;
  avatar: string | null;
  gender: string | null;
  role: string;
}

// Login response data structure: { accessToken: string, user: UserType }
export interface LoginResponseData {
  accessToken: string;
  user: UserType;
}

// Full login response type using common ResponseType
// Override data type to be LoginResponseData directly (not wrapped in { result: ... })
export type LoginResponseType = ResponseType<LoginResponseData, LoginResponseData>;

// Legacy type for backward compatibility (deprecated, use LoginResponseType instead)
export interface LoginResType {
  user: UserType;
  accessToken: string;
}

// Legacy type for backward compatibility (deprecated, use LoginResponseType instead)
export type UserAuthResponseType = LoginResponseType;

export interface LoginRequest {
  username: string;
  password: string;
}