import { ResponseType } from './response-type';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  idCard: string;
  dob: string | null;
  avatar: string | null;
  gender: Gender | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
  idCard: string;
  dob: string | null;
  gender: Gender | null;
  currentPassword?: string;
  password?: string;
}

export type ProfileResponseType = ResponseType<Profile>;
export type UpdateProfileResponseType = ResponseType<Profile>;

